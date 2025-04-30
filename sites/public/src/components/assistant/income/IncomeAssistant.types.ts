import { ReactNode } from "react"
import { Message } from "../context/AssistantContext"

// Question type for the income flow
export interface IncomeQuestion {
  id: string
  question: string
  type: "number" | "currency" | "boolean"
  validation: (value: string) => boolean
}

// Props for the IncomeAssistant component
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

// Income calculation result
export interface IncomeCalculation {
  weeklyIncome: number
  annualIncome: number
  hourlyRate: number
  hoursPerWeek: number
}

// Form data for income calculations
export interface IncomeFormData {
  annualIncome: number
  hoursPerWeek: number
}
