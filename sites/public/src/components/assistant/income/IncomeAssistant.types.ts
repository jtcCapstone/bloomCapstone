import { ReactNode } from "react"

export interface Message {
  id: string
  content: string
  type: "user" | "assistant"
  timestamp: Date
}

export interface ChatState {
  messages: Message[]
  isProcessing: boolean
  currentStep: number
  totalSteps: number
}

export interface IncomeAssistantProps {
  /** Whether the assistant is currently open */
  isOpen: boolean
  /** Callback function when the assistant is closed */
  onClose: () => void
  /** Additional CSS classes */
  className?: string
  /** Element ID */
  id?: string
  /** ID for selecting in tests */
  testId?: string
  /** Accessible label for the assistant */
  ariaLabel?: string
  /** The ID of the element the assistant controls */
  ariaControls?: string
  /** Optional strings for customization */
  strings?: {
    title?: string
    close?: string
    error?: string
  }
  children?: ReactNode
  // Chat-related props for #15
  messages?: Message[]
  isProcessing?: boolean
  onSendMessage?: (message: string) => void
  currentStep?: number
  totalSteps?: number
}
