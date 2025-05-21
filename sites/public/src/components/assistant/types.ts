export interface ChatMessage {
  id: string
  content: string
  sender: "assistant" | "user"
  timestamp: Date
}

export interface AssistantQuestion {
  id: string
  question: string
  type: string
  validation?: (value: string) => boolean
  invalidMessage?: string
  dynamicQuestionHandler?: (input: string, responses: string[]) => AssistantQuestion[]
}

export interface AssistantScript {
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

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export interface ChatbotPanelProps {
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

export interface IncomeAssistantProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: (estimate: string) => void
  _strings?: { title?: string }
}
