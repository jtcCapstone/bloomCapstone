/*
 * MONOLITHIC ASSISTANT COMPONENT
 * ============================
 * This file implements a complete chatbot assistant system with the following features:
 * - Structured conversation flow with validation
 * - Fallback to LLM (AI) mode for complex scenarios
 * - Dynamic question generation based on user responses
 * - State management for multi-step conversations
 * - Error boundary and recovery mechanisms
 *
 * Architecture Overview:
 * 1. Types & Interfaces - Define the structure for messages, questions, and scripts
 * 2. Controller Logic - Manages conversation flow and state
 * 3. UI Components - Renders the chat interface
 * 4. Script Definition - Defines the specific conversation flow for income calculation
 */

import React, {
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useState,
  useRef,
  Component,
  ErrorInfo,
} from "react"
import axios from "axios"
import styles from "./ChatbotPanel.module.scss"
import ErrorBoundaryStyles from "./ErrorBoundary.module.scss"

// =========================================
// Type Definitions
// =========================================

/**
 * Represents a single message in the chat conversation
 * Can be from either the user or assistant
 */
interface ChatMessage {
  id: string
  content: string
  sender: "assistant" | "user"
  timestamp: Date
}

/**
 * Defines a question in the conversation flow
 * Includes validation and dynamic question generation capabilities
 */
interface AssistantQuestion {
  id: string
  question: string
  type: string
  validation?: (value: string) => boolean
  dynamicQuestionHandler?: (input: string, responses: string[]) => AssistantQuestion[]
}

/**
 * Defines the complete conversation script
 * Including welcome message, questions, and result calculation
 */
interface AssistantScript {
  welcomeMessage: string
  questions: AssistantQuestion[]
  fallbackInvalid: string
  fallbackError: string
  getFinalResult?: (responses: string[]) => {
    estimate: string
    requiresConfirmation: boolean
    finalMessage: string
  } | null
}

/**
 * Props for the Error Boundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Props for the Chatbot Panel component
 */
interface ChatbotPanelProps {
  onMinimize: () => void
  messages: ChatMessage[]
  isProcessing: boolean
  onSendMessage: (message: string) => void
  onStartOver: () => void
  error: string | null
  currentStep: number
  totalSteps: number
  title?: string
  showSwitchLLMButton?: boolean
  onSwitchLLMMode?: () => void
  customButtonText?: string
  onCustomButtonClick?: () => void
  pureLLMMode?: boolean
}

/**
 * Props for the Income Assistant component
 */
interface IncomeAssistantProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: (estimate: string) => void
  _strings?: { title?: string }
}

// =========================================
// Assistant Controller
// =========================================

/**
 * Creates a controller instance that manages the conversation flow
 * Handles:
 * - User input processing
 * - State management
 * - LLM fallback
 * - Response validation
 */
const createAssistantController = (script: AssistantScript) => {
  // Internal state
  let currentStep = 0
  const responses: string[] = []
  let pureLlmMode = false
  let invalidInputCount = 0
  let invalidInputs: string[] = []
  let currentQuestions: AssistantQuestion[] = []
  let messages: ChatMessage[] = []
  let finalEstimate = ""
  let confirmReady = false
  let validResponses: { [key: number]: string } = {}

  /**
   * Processes user input through the structured logic flow
   * Includes validation, error handling, and LLM fallback
   */
  const handleUserInputLogic = async (
    input: string
  ): Promise<{ responseText: string; flowEnded: boolean }> => {
    console.log("Current valid responses:", validResponses)
    console.log("Processing input for step:", currentStep)

    const question = currentQuestions[currentStep]
    let responseText = ""

    if (question && typeof question.validation === "function") {
      const isValid = question.validation(input)

      if (!isValid) {
        invalidInputCount++
        invalidInputs.push(input)

        if (invalidInputCount >= 2) {
          // Two invalid inputs in a row, use LLM
          const combinedPrompt = `User provided invalid responses: ${invalidInputs
            .slice(-2)
            .join(", ")}. Please help interpret.`
          const llmResponse = await sendLLMMessage(combinedPrompt, Object.values(validResponses))
          responseText = llmResponse
          invalidInputCount = 0
          invalidInputs = []
        } else {
          responseText = script.fallbackInvalid
        }

        // Don't advance step on invalid input
        return { responseText, flowEnded: false }
      } else {
        // Valid input
        validResponses[currentStep] = input
        invalidInputCount = 0
        invalidInputs = []

        if (question.dynamicQuestionHandler) {
          const newQuestions = question.dynamicQuestionHandler(input, Object.values(validResponses))
          if (newQuestions && newQuestions.length > 0) {
            currentQuestions = [...currentQuestions, ...newQuestions]
          }
        }

        currentStep++
        if (currentStep < currentQuestions.length) {
          responseText = currentQuestions[currentStep].question
          return { responseText, flowEnded: false }
        } else {
          // All questions answered
          return { responseText: "", flowEnded: true }
        }
      }
    }

    return { responseText: "An error occurred", flowEnded: false }
  }

  /**
   * Initializes or resets the controller state
   * Called at start and when resetting the conversation
   */
  const initialize = async (): Promise<void> => {
    currentStep = 0
    responses.splice(0, responses.length)
    pureLlmMode = false
    invalidInputCount = 0
    invalidInputs = []
    messages = []
    finalEstimate = ""
    confirmReady = false
    validResponses = {}
    currentQuestions = [...script.questions]

    const initMsgText = `${script.welcomeMessage}\n${
      currentQuestions && currentQuestions.length > 0 ? currentQuestions[0].question : ""
    }`
    await Promise.resolve() // Add async operation to satisfy linter
    messages.push({
      id: `${Date.now()}`,
      content: initMsgText,
      sender: "assistant",
      timestamp: new Date(),
    })
  }

  const getFinalResult = () => {
    if (Object.keys(validResponses).length === 0) return null

    const responses = Object.values(validResponses)
    console.log("Getting final result with valid responses:", responses)
    return script.getFinalResult?.(responses)
  }

  return {
    initialize,
    getCurrentStep: () => currentStep,
    getMessages: () => messages,
    getFinalEstimate: () => finalEstimate,
    isConfirmReady: () => confirmReady,
    isPureLlmMode: () => pureLlmMode,
    getCurrentQuestionsCount: () => currentQuestions.length,
    getValidResponses: () => validResponses,
    getFinalResult,
    handleUserInputLogic,
    handleUserInputLLM: async (input: string) => {
      const response = await sendLLMMessage(input, Object.values(validResponses))
      currentStep++
      invalidInputCount = 0
      invalidInputs = []
      return response
    },
  }
}

// =========================================
// ChatbotPanel Component
// =========================================

/**
 * Main UI component for the chatbot
 * Handles:
 * - Message display
 * - User input
 * - Button actions
 * - Visual state management
 */
const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  onMinimize,
  messages,
  isProcessing,
  onSendMessage,
  onStartOver,
  error,
  currentStep,
  totalSteps,
  title = "Assistant",
  showSwitchLLMButton,
  onSwitchLLMMode,
  customButtonText,
  onCustomButtonClick,
  pureLLMMode,
}) => {
  console.log("ChatbotPanel render:", {
    messages,
    isProcessing,
    currentStep,
    totalSteps,
    pureLLMMode,
    customButtonText,
  })
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [messages, isProcessing])

  const handleUserInput = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    onSendMessage(inputValue.trim())
    setInputValue("")
    inputRef.current?.focus()
  }

  // Determine if we should show the input box
  const showInput =
    pureLLMMode || // Show if in LLM mode
    (currentStep < totalSteps && // Show during normal conversation
      (!customButtonText || // No custom button means we're not in confirmation state
        (customButtonText !== "Confirm Estimate" &&
          customButtonText !== "Switch to Pure LLM Mode"))) // Hide only during confirmation state

  return (
    <ErrorBoundary>
      <div className={styles.chatbotContainer}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>{pureLLMMode ? "AI Assistant" : title}</span>
          <button onClick={onMinimize} className={styles.minimizeButton}>
            &minus;
          </button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.sender === "user" ? styles.messageUser : styles.messageBot}
            >
              <div className={msg.sender === "assistant" ? styles.botBubble : styles.userBubble}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {showInput && (
          <form onSubmit={handleUserInput} className={styles.inputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.textInput}
              placeholder="Type your answer..."
              disabled={isProcessing}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim() || isProcessing}
            >
              {isProcessing ? "Processing..." : "Send"}
            </button>
          </form>
        )}

        {showSwitchLLMButton && onSwitchLLMMode && (
          <div className={styles.switchLLMContainer}>
            <button onClick={onSwitchLLMMode} className={styles.switchLLMButton}>
              Switch to Pure LLM Mode
            </button>
          </div>
        )}

        {customButtonText && onCustomButtonClick && (
          <div className={styles.customButtonContainer}>
            <button onClick={onCustomButtonClick} className={styles.customButton}>
              {customButtonText}
            </button>
          </div>
        )}

        <div className={styles.submitContainer}>
          <button onClick={onStartOver} disabled={isProcessing} className={styles.submitButton}>
            Start Over
          </button>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// =========================================
// ChatbotContainer Component
// =========================================

/**
 * Container component that connects the UI with the controller
 * Manages:
 * - State synchronization
 * - Message handling
 * - Mode switching
 * - Initialization
 */
const ChatbotContainer = forwardRef(
  (
    props: {
      assistantScript: AssistantScript
      onMinimize?: () => void
      onConfirm?: (estimate: string) => void
    },
    ref
  ) => {
    const { assistantScript, onMinimize, onConfirm } = props

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [currentStep, setCurrentStep] = useState<number>(0)
    const [pureLLMMode, setPureLLMMode] = useState<boolean>(false)
    const [confirmReady, setConfirmReady] = useState<boolean>(false)
    const [hasConfirmed, setHasConfirmed] = useState<boolean>(false)
    const [isInitialized, setIsInitialized] = useState<boolean>(false)

    const controllerRef = useRef<ReturnType<typeof createAssistantController> | null>(null)

    // Initialize only once
    useEffect(() => {
      if (!isInitialized) {
        console.log("Initializing ChatbotContainer for the first time")
        controllerRef.current = createAssistantController(assistantScript)
        const initChat = async () => {
          if (controllerRef.current) {
            await controllerRef.current.initialize()
            const initialMessages = controllerRef.current.getMessages()
            setMessages(initialMessages)
            setIsInitialized(true)
          }
        }
        void initChat()
      }
    }, [assistantScript, isInitialized])

    const handleSendMessage = useCallback(
      async (input: string) => {
        console.log("handleSendMessage called with:", input)
        if (!input.trim() || isProcessing || !controllerRef.current) {
          console.log("Message rejected:", {
            emptyInput: !input.trim(),
            isProcessing,
            hasController: !!controllerRef.current,
          })
          return
        }

        setIsProcessing(true)
        // Add user message immediately
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          content: input,
          sender: "user",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])

        try {
          if (pureLLMMode) {
            console.log("Handling in LLM mode")
            const response = await controllerRef.current.handleUserInputLLM(input)
            const message: ChatMessage = {
              id: `llm-${Date.now()}`,
              content: response,
              sender: "assistant",
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, message])
          } else {
            console.log("Handling in logic mode")
            const { responseText, flowEnded } = await controllerRef.current.handleUserInputLogic(
              input
            )
            console.log("Logic response:", { responseText, flowEnded })

            if (responseText) {
              const message: ChatMessage = {
                id: `logic-${Date.now()}`,
                content: responseText,
                sender: "assistant",
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, message])
            }

            if (flowEnded) {
              const finalResult = controllerRef.current.getFinalResult()
              if (finalResult) {
                const message: ChatMessage = {
                  id: `final-${Date.now()}`,
                  content: finalResult.finalMessage,
                  sender: "assistant",
                  timestamp: new Date(),
                }
                setMessages((prev) => [...prev, message])
                setConfirmReady(finalResult.requiresConfirmation)
              }
            }
          }
        } catch (error) {
          console.error("Error in handleSendMessage:", error)
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            content: assistantScript.fallbackError,
            sender: "assistant",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setIsProcessing(false)
        }
      },
      [isProcessing, pureLLMMode, assistantScript]
    )

    const handleStartOver = useCallback(async () => {
      console.log("Starting over...")
      setIsProcessing(true)
      setMessages([])
      setCurrentStep(0)
      setPureLLMMode(false)
      setConfirmReady(false)
      setHasConfirmed(false)

      if (controllerRef.current) {
        await controllerRef.current.initialize()
        const initialMessages = controllerRef.current.getMessages()
        setMessages(initialMessages)
      }
      setIsProcessing(false)
    }, [])

    const handleCustomButtonClick = useCallback(() => {
      if (confirmReady && !hasConfirmed && onConfirm && controllerRef.current) {
        const finalResult = controllerRef.current.getFinalResult()
        if (finalResult) {
          console.log("Confirming estimate:", finalResult.estimate)
          onConfirm(finalResult.estimate)
          setHasConfirmed(true)
        }
      } else if (confirmReady && hasConfirmed) {
        setPureLLMMode(true)
        setConfirmReady(false) // Hide the button after switching to LLM mode

        // Add welcome message for LLM mode
        const welcomeMessage: ChatMessage = {
          id: `llm-welcome-${Date.now()}`,
          content:
            "I'm now in AI Assistant mode. Feel free to ask me any questions about income calculations or related topics!",
          sender: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, welcomeMessage])
      }
    }, [confirmReady, hasConfirmed, onConfirm])

    useImperativeHandle(ref, () => ({
      sendMessage: handleSendMessage,
      startOver: handleStartOver,
    }))

    const customButtonText =
      confirmReady && !pureLLMMode
        ? hasConfirmed
          ? "Switch to Pure LLM Mode"
          : "Confirm Estimate"
        : undefined

    return (
      <ChatbotPanel
        onMinimize={onMinimize || (() => console.log("Minimize action triggered (default)"))}
        messages={messages}
        isProcessing={isProcessing}
        onSendMessage={handleSendMessage}
        onStartOver={handleStartOver}
        error={null}
        currentStep={currentStep}
        totalSteps={controllerRef.current?.getCurrentQuestionsCount() || 0}
        title={pureLLMMode ? "AI Assistant" : "Smart-Housing Assistant"}
        pureLLMMode={pureLLMMode}
        customButtonText={customButtonText}
        onCustomButtonClick={handleCustomButtonClick}
      />
    )
  }
)

// =========================================
// Error Boundary Component
// =========================================

/**
 * Error boundary component to catch and handle errors gracefully
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className={ErrorBoundaryStyles.errorContainer}>
          <h2>Something went wrong</h2>
          <button onClick={this.handleReset}>Try Again</button>
        </div>
      )
    }

    return this.props.children
  }
}

// =========================================
// LLM Service
// =========================================

/**
 * Service to handle communication with the LLM backend
 * Provides fallback for complex scenarios
 */
const sendLLMMessage = async (message: string, history: string[] = []): Promise<string> => {
  try {
    const response = await axios.post<{ response: string }>(
      `${process.env.NEXT_PUBLIC_BACKEND_API_BASE || "http://localhost:3100"}/llm/chat`,
      { message, history },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    return response.data.response
  } catch (error) {
    console.error("Error sending chat message:", error)
    return "Sorry, I encountered an issue processing your request."
  }
}

// =========================================
// Income Assistant Implementation
// =========================================

/**
 * Income calculation specific question set
 * Handles:
 * - Household member count
 * - Per-person income details
 * - Dynamic question generation based on household size
 */
const INCOME_QUESTIONS: AssistantQuestion[] = [
  {
    id: "household_income",
    question: "How many people in your house earn an income?",
    type: "number",
    validation: (value: string) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    },
    dynamicQuestionHandler: (input: string, _responses: string[]): AssistantQuestion[] => {
      const questionsToAdd: AssistantQuestion[] = []
      const count = parseInt(input)
      const personCount = isNaN(count) || count < 1 ? 1 : Math.min(count, 12)

      for (let i = 0; i < personCount; i++) {
        questionsToAdd.push({
          id: `hourly_rate_${i + 1}`,
          question: `For person ${i + 1}, how much do you make per hour?`,
          type: "currency",
          validation: (value: string) => {
            const cleaned = value.replace(/[$,]/g, "")
            return /^[0-9]+(\.[0-9]+)?$/.test(cleaned) && parseFloat(cleaned) > 0
          },
        })
        questionsToAdd.push({
          id: `hours_per_week_${i + 1}`,
          question: `For person ${i + 1}, how many hours a week do you usually work?`,
          type: "number",
          validation: (value: string) => {
            const num = parseInt(value)
            return !isNaN(num) && num > 0 && num <= 168
          },
        })
      }
      return questionsToAdd
    },
  },
]

/**
 * Income assistant specific script
 * Includes:
 * - Welcome message
 * - Income-specific questions
 * - Income calculation logic
 * - Result formatting
 */
const incomeAssistantScript: AssistantScript = {
  welcomeMessage: "Welcome! Let's calculate your income.",
  questions: INCOME_QUESTIONS,
  fallbackInvalid: "Invalid answer.",
  fallbackError: "Error processing responses.",
  getFinalResult: (
    responses: string[]
  ): { estimate: string; requiresConfirmation: boolean; finalMessage: string } | null => {
    console.log("getFinalResult called with responses:", responses)
    const householdCount = parseInt(responses[0], 10)
    console.log("Household count:", householdCount)

    if (isNaN(householdCount) || householdCount <= 0) {
      return {
        estimate: "0",
        requiresConfirmation: false,
        finalMessage: "Invalid household count provided.",
      }
    }

    let totalAnnualIncome = 0

    // For each person
    for (let i = 0; i < householdCount; i++) {
      const hourlyRateStr = responses[1 + i * 2] // First response is household count, then pairs of rate/hours
      const hoursPerWeekStr = responses[2 + i * 2]

      console.log(`Person ${i + 1} - Rate: ${hourlyRateStr}, Hours: ${hoursPerWeekStr}`)

      const hourlyRate = parseFloat(hourlyRateStr.replace(/[^0-9.]/g, ""))
      const hoursPerWeek = parseFloat(hoursPerWeekStr)

      if (!isNaN(hourlyRate) && !isNaN(hoursPerWeek)) {
        const personIncome = hourlyRate * hoursPerWeek * 52 // 52 weeks in a year
        console.log(`Person ${i + 1} annual income: ${personIncome}`)
        totalAnnualIncome += personIncome
      }
    }

    console.log("Total annual income calculated:", totalAnnualIncome)

    return {
      estimate: totalAnnualIncome.toString(),
      requiresConfirmation: true,
      finalMessage: `Thank you! Based on your inputs, your estimated annual income is $${totalAnnualIncome.toLocaleString()}. Confirm Estimate`,
    }
  },
}

/**
 * Main Income Assistant component
 * Entry point for the income calculation assistant
 * Handles:
 * - Integration with parent form
 * - Estimate confirmation
 * - Mode switching
 */
const IncomeAssistant: React.FC<IncomeAssistantProps> = ({
  isOpen,
  onClose,
  onConfirm = (estimate: string) => {
    console.log("IncomeAssistant onConfirm called with:", estimate)
    // Remove any non-numeric characters and convert to string
    const cleanEstimate = estimate.replace(/[^0-9.]/g, "")
    console.log("Cleaned estimate:", cleanEstimate)
    onConfirm(cleanEstimate)
  },
  _strings,
}) => {
  console.log("IncomeAssistant render:", { isOpen })
  return isOpen ? (
    <ErrorBoundary>
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <ChatbotContainer
          assistantScript={incomeAssistantScript}
          onMinimize={onClose}
          onConfirm={onConfirm}
        />
      </div>
    </ErrorBoundary>
  ) : null
}

export default IncomeAssistant
