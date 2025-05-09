import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react"
import ChatbotPanel from "./ChatbotPanel"
import { createAssistantController, AssistantController } from "../controller/AssistantController"
import { ChatMessage } from "../controller/AssistantController.types"

// Defines the structure for a question object within the script.
interface AssistantQuestion {
  id: string
  question: string
  type: string
  validation?: (value: string) => boolean
  dynamicQuestionHandler?: (input: string, responses: string[]) => AssistantQuestion[]
}

// Defines the structure for the assistant script.
export interface AssistantScript {
  welcomeMessage: string
  questions: AssistantQuestion[]
  fallbackInvalid: string
  fallbackError: string
  // Optional function to determine the final result and confirmation state.
  getFinalResult?: (responses: string[]) => {
    estimate: string
    requiresConfirmation: boolean
    finalMessage: string
  } | null
}

// Container component connecting the UI (ChatbotPanel) to the controller logic.
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

    // Local state synchronized from the controller.
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [currentStep, setCurrentStep] = useState<number>(0)
    const [pureLLMMode, setPureLLMMode] = useState<boolean>(false)

    // State related to confirmation UI flow.
    const [confirmReady, setConfirmReady] = useState<boolean>(false)
    const [hasConfirmed, setHasConfirmed] = useState<boolean>(false) // Tracks if 'Confirm' button has been clicked

    const controllerRef = useRef<AssistantController | null>(null)

    // Synchronizes local React state with the controller's internal state.
    const syncStateFromController = useCallback(() => {
      if (controllerRef.current) {
        setMessages(controllerRef.current.getMessages())
        setCurrentStep(controllerRef.current.getCurrentStep())
        setPureLLMMode(controllerRef.current.isPureLlmMode())
        setConfirmReady(controllerRef.current.isConfirmReady())
      }
    }, [])

    // Initializes the assistant controller on mount or script change.
    useEffect(() => {
      controllerRef.current = createAssistantController(assistantScript)
      const initChat = async () => {
        if (controllerRef.current) {
          await controllerRef.current.initialize()
          syncStateFromController()
        }
      }
      void initChat()
    }, [assistantScript, syncStateFromController])

    // Resets the UI confirmation state ('hasConfirmed') when the controller signals confirmation is ready.
    useEffect(() => {
      if (confirmReady) {
        setHasConfirmed(false)
      }
    }, [confirmReady])

    // Processes user input by calling the controller and syncing state.
    const handleSendMessage = useCallback(
      async (input: string) => {
        if (!input.trim() || isProcessing || !controllerRef.current) {
          return
        }

        setIsProcessing(true)
        try {
          await controllerRef.current.sendMessage(input)
          syncStateFromController()
        } catch (error) {
          console.error("Error processing message:", error)
          // Fallback UI error message if controller doesn't handle adding it.
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}`,
              content: assistantScript.fallbackError || "An error occurred.",
              sender: "assistant",
              timestamp: new Date(),
            },
          ])
        } finally {
          setIsProcessing(false)
        }
      },
      [isProcessing, controllerRef, syncStateFromController, assistantScript.fallbackError]
    )

    // Toggles pure LLM mode using the controller and syncs state.
    const handleSwitchLLMMode = useCallback(() => {
      if (controllerRef.current) {
        controllerRef.current.switchLLMMode()
        syncStateFromController()
      }
    }, [controllerRef, syncStateFromController])

    // Resets the conversation using the controller and syncs state.
    const handleStartOver = useCallback(async () => {
      console.log("Start Over button clicked")
      if (controllerRef.current) {
        setIsProcessing(true)
        await controllerRef.current.startOver()
        syncStateFromController()
        setHasConfirmed(false) // Reset UI confirmation state
        setIsProcessing(false)
      }
    }, [controllerRef, syncStateFromController])

    // Handles clicks on the custom confirmation/mode switch button.
    const handleCustomButtonClick = useCallback(() => {
      if (confirmReady && !hasConfirmed) {
        // First click: Confirm action
        if (onConfirm) {
          const estimateToConfirm = controllerRef.current?.getFinalEstimate() || ""
          console.log("Confirming with value:", estimateToConfirm)
          onConfirm(estimateToConfirm)
        }
        setHasConfirmed(true) // Mark as confirmed in UI
      } else if (confirmReady && hasConfirmed) {
        // Second click: Switch to Pure LLM Mode
        console.log("Switching to Pure LLM Mode")
        handleSwitchLLMMode()
      }
    }, [confirmReady, hasConfirmed, onConfirm, handleSwitchLLMMode, controllerRef])

    // Exposes imperative methods to parent components.
    useImperativeHandle(ref, () => ({
      sendMessage: handleSendMessage,
      startOver: handleStartOver,
    }))

    // Determine text and handler for the custom button based on confirmation state.
    const customButtonText = confirmReady
      ? hasConfirmed
        ? "Switch to Pure LLM Mode"
        : "Confirm Estimate"
      : undefined

    const onCustomButtonClickProp = confirmReady ? handleCustomButtonClick : undefined

    // Get total questions count from the controller for progress display.
    const totalQuestions = controllerRef.current
      ? controllerRef.current.getCurrentQuestionsCount()
      : assistantScript.questions.length

    return (
      <ChatbotPanel
        onMinimize={
          onMinimize ||
          (() => {
            console.log("Minimize action triggered (default)")
          })
        }
        messages={messages.map((msg, index) => ({
          id: index.toString(), // Using index as ID for display
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(),
        }))}
        isProcessing={isProcessing}
        onSendMessage={handleSendMessage}
        onStartOver={handleStartOver}
        error={null} // Assuming error handling is simpler at panel level
        currentStep={currentStep}
        totalSteps={totalQuestions} // Pass dynamic question count
        title="Smart-Housing Assistant"
        pureLLMMode={pureLLMMode} // Control input visibility
        customButtonText={customButtonText}
        onCustomButtonClick={onCustomButtonClickProp}
      />
    )
  }
)

export default ChatbotContainer
