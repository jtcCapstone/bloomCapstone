import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/router"
import { AssistantScript, ChatMessage } from "./types"
import ChatbotPanel from "./ChatbotPanel"
import { createAssistantController } from "./controller"

interface ChatbotContainerProps {
  assistantScript: AssistantScript
  onMinimize?: () => void
  onConfirm?: (estimate: string) => void
}

const ChatbotContainer = forwardRef(
  ({ assistantScript, onMinimize, onConfirm }: ChatbotContainerProps, ref) => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [pureLLMMode, setPureLLMMode] = useState(false)
    const [confirmReady, setConfirmReady] = useState(false)
    const [hasConfirmed, setHasConfirmed] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const router = useRouter()

    const controllerRef = useRef<ReturnType<typeof createAssistantController> | null>(null)

    useEffect(() => {
      if (!isInitialized) {
        controllerRef.current = createAssistantController(assistantScript)
        const initChat = () => {
          if (controllerRef.current) {
            // Start in pure LLM mode if there are no questions in the script
            const shouldStartInLLMMode = !assistantScript.questions?.length
            setPureLLMMode(shouldStartInLLMMode)

            controllerRef.current.initialize()

            // If starting in LLM mode, use the page-specific welcome message
            if (shouldStartInLLMMode) {
              const pageData =
                assistantScript.pageDataMap?.[router.pathname] ||
                assistantScript.pageDataMap?.["default"]
              const welcomeMessage =
                pageData?.directLlmWelcomeMessage ||
                assistantScript.directLlmWelcomeMessage ||
                assistantScript.welcomeMessage

              setMessages([
                {
                  id: `llm-welcome-${Date.now()}`,
                  content: welcomeMessage,
                  sender: "assistant",
                  timestamp: new Date(),
                },
              ])
            } else {
              setMessages(controllerRef.current.getMessages())
            }

            setIsInitialized(true)
          }
        }
        void initChat()
      }
    }, [assistantScript, isInitialized, router.pathname])

    const handleSendMessage = useCallback(
      async (input: string) => {
        if (!input.trim() || isProcessing || !controllerRef.current) return

        setIsProcessing(true)
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          content: input,
          sender: "user",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])

        try {
          if (pureLLMMode) {
            const response = await controllerRef.current.handleUserInputLLM(input)
            setMessages((prev) => [
              ...prev,
              {
                id: `llm-${Date.now()}`,
                content: response,
                sender: "assistant",
                timestamp: new Date(),
              },
            ])
          } else {
            const { responseText, flowEnded } = await controllerRef.current.handleUserInputLogic(
              input
            )
            if (responseText) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `logic-${Date.now()}`,
                  content: responseText,
                  sender: "assistant",
                  timestamp: new Date(),
                },
              ])
            }

            if (flowEnded) {
              const finalResult = controllerRef.current.getFinalResult()
              if (finalResult) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `final-${Date.now()}`,
                    content: finalResult.finalMessage,
                    sender: "assistant",
                    timestamp: new Date(),
                  },
                ])
                setConfirmReady(finalResult.requiresConfirmation)
              }
            }
          }
        } catch (error) {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              content: assistantScript.fallbackError,
              sender: "assistant",
              timestamp: new Date(),
            },
          ])
        } finally {
          setIsProcessing(false)
        }
      },
      [isProcessing, pureLLMMode, assistantScript]
    )

    const handleStartOver = useCallback(() => {
      setIsProcessing(true)
      setMessages([])
      setCurrentStep(0)
      setPureLLMMode(false)
      setConfirmReady(false)
      setHasConfirmed(false)

      if (controllerRef.current) {
        controllerRef.current.initialize()
        setMessages(controllerRef.current.getMessages())
      }
      setIsProcessing(false)
    }, [])

    const handleCustomButtonClick = useCallback(() => {
      if (confirmReady && !hasConfirmed && onConfirm && controllerRef.current) {
        const finalResult = controllerRef.current.getFinalResult()
        if (finalResult) {
          onConfirm(finalResult.estimate)
          setHasConfirmed(true)
        }
      } else if (confirmReady && hasConfirmed) {
        setPureLLMMode(true)
        setConfirmReady(false)

        // Use page-specific welcome message when switching to LLM mode
        const pageData =
          assistantScript.pageDataMap?.[router.pathname] || assistantScript.pageDataMap?.["default"]
        const welcomeMessage =
          pageData?.directLlmWelcomeMessage ||
          assistantScript.directLlmWelcomeMessage ||
          "I'm now in AI Assistant mode. Feel free to ask me any questions!"

        setMessages((prev) => [
          ...prev,
          {
            id: `llm-welcome-${Date.now()}`,
            content: welcomeMessage,
            sender: "assistant",
            timestamp: new Date(),
          },
        ])
      }
    }, [confirmReady, hasConfirmed, onConfirm, assistantScript, router.pathname])

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

    const noop = () => undefined

    return (
      <ChatbotPanel
        onMinimize={onMinimize ?? noop}
        messages={messages}
        isProcessing={isProcessing}
        onSendMessage={handleSendMessage}
        onStartOver={handleStartOver}
        error={null}
        currentStep={currentStep}
        totalSteps={controllerRef.current?.getCurrentQuestionsCount() ?? 0}
        title={pureLLMMode ? "AI Assistant" : "Smart-Housing Assistant"}
        pureLLMMode={pureLLMMode}
        customButtonText={customButtonText}
        onCustomButtonClick={handleCustomButtonClick}
      />
    )
  }
)

export default ChatbotContainer
