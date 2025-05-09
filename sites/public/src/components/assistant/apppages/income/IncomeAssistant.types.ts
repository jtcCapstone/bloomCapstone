/*
  IncomeAssistant.types.ts
  ========================
  Type definitions for the Income Assistant component.
*/

import { ReactNode } from "react"
import { ChatMessage } from "../../controller/AssistantController.types"

// Represents a single income-related question.
export interface IncomeQuestion {
  id: string
  question: string
  type: "number" | "currency" | "boolean"
  validation: (value: string) => boolean
}

// Props for the IncomeAssistant component.
export interface IncomeAssistantProps {
  /** Whether the assistant is currently open */
  isOpen: boolean
  /** Callback function when the assistant is closed */
  onClose: () => void
  /** Additional CSS classes for styling */
  className?: string
  /** Unique element identifier */
  id?: string
  /** Identifier for testing purposes */
  testId?: string
  /** Accessible label for the assistant */
  ariaLabel?: string
  /** The ID of the element the assistant controls */
  ariaControls?: string
  /** Optional customizable strings for UI text */
  strings?: {
    title?: string
    close?: string
    error?: string
  }
  /** Nested child elements */
  children?: ReactNode
  /** Array of chat messages */
  messages?: ChatMessage[]
  /** Indicates if the assistant is currently processing a response */
  isProcessing?: boolean
  /** Callback function to send a message */
  onSendMessage?: (message: string) => void
  /** The current step in a multi-step process */
  currentStep?: number
  /** The total number of steps in a multi-step process */
  totalSteps?: number
}

// Represents the result of an income calculation.
export interface IncomeCalculation {
  weeklyIncome: number
  annualIncome: number
  hourlyRate: number
  hoursPerWeek: number
}

// Represents the form data used in income calculations.
export interface IncomeFormData {
  annualIncome: number
  hoursPerWeek: number
}

// Defines the assistant script to drive the conversation flow.
export interface AssistantScript {
  welcomeMessage: string
  questions: IncomeQuestion[]
  fallbackInvalid: string
  fallbackError: string
  /** Optional function to finalize results based on responses */
  finalize?: (responses: string[]) => string
}
