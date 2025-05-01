import React, { useEffect, useCallback } from "react"
import { IncomeAssistantProps } from "./IncomeAssistant.types"
import { useAssistant } from "../context/AssistantContext"
import ChatbotPanel from "../shared/ChatbotPanel"
import ErrorBoundary from "../shared/ErrorBoundary"

// Define our question flow
const INCOME_QUESTIONS = [
  {
    id: "household_income",
    question: "How many people in your house earn an income?",
    type: "number",
    validation: (value: string) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    },
  },
  {
    id: "hourly_rate",
    question: "How much do you make per hour?",
    type: "currency",
    validation: (value: string) => {
      const num = parseFloat(value.replace(/[^0-9.]/g, ""))
      return !isNaN(num) && num > 0
    },
  },
  {
    id: "hours_per_week",
    question: "How many hours a week do you usually work?",
    type: "number",
    validation: (value: string) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0 && num <= 168
    },
  },
  {
    id: "other_income",
    question: "Do you have any other form of verifiable income?",
    type: "boolean",
    validation: (value: string) => {
      return ["yes", "no", "y", "n"].includes(value.toLowerCase())
    },
  },
]

export const IncomeAssistant: React.FC<IncomeAssistantProps> = ({
  isOpen,
  onClose,
  strings = {
    title: "Income Assistant",
    close: "Close",
    error: "An error occurred",
  },
}) => {
  const {
    state: { messages, isProcessing, currentStep, error },
    sendMessage,
    setStep,
    setError,
    reset,
  } = useAssistant()

  // Handle user responses
  const handleUserResponse = useCallback(
    (response: string) => {
      try {
        const currentQuestion = INCOME_QUESTIONS[currentStep]

        // Validate response
        if (!currentQuestion.validation(response)) {
          setError("Please provide a valid response")
          return
        }

        // Clear any previous errors
        setError(null)

        // Move to next question or finish
        if (currentStep < INCOME_QUESTIONS.length - 1) {
          setStep(currentStep + 1)
          setTimeout(() => {
            sendMessage(INCOME_QUESTIONS[currentStep + 1].question, "assistant")
          }, 0)
        } else {
          // Final question answered; set step to total to trigger completion
          setStep(INCOME_QUESTIONS.length)

          // Calculate final income
          const answers = messages.filter((m) => m.type === "user").map((m) => m.content)

          // Calculate weekly income
          const hourlyRate = parseFloat(answers[1].replace(/[^0-9.]/g, ""))
          const hoursPerWeek = parseInt(answers[2])
          const weeklyIncome = hourlyRate * hoursPerWeek

          // Calculate annual income
          const annualIncome = weeklyIncome * 52

          setTimeout(() => {
            sendMessage(
              `Thank you! Based on your inputs, your estimated annual income is $${annualIncome.toLocaleString()}. You can now proceed with your application.`,
              "assistant"
            )
          }, 0)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : strings.error)
      }
    },
    [currentStep, messages, sendMessage, setError, setStep, strings.error]
  )

  // Initialize the conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = "Welcome! I'll help you calculate your income. Let's get started."
      sendMessage(welcomeMessage, "assistant")
      sendMessage(INCOME_QUESTIONS[0].question, "assistant")
    }
  }, [isOpen, messages.length, sendMessage])

  // Reset the conversation
  const handleStartOver = useCallback(() => {
    reset()
    const welcomeMessage = "Welcome! I'll help you calculate your income. Let's get started."
    sendMessage(welcomeMessage, "assistant")
    sendMessage(INCOME_QUESTIONS[0].question, "assistant")
  }, [reset, sendMessage])

  if (!isOpen) return null

  return (
    <ErrorBoundary>
      <ChatbotPanel
        onMinimize={onClose}
        messages={messages}
        isProcessing={isProcessing}
        onSendMessage={(message: string) => {
          // Add user's message and then process it
          sendMessage(message, "user")
          handleUserResponse(message)
        }}
        onStartOver={() => handleStartOver()}
        error={error}
        currentStep={currentStep}
        totalSteps={INCOME_QUESTIONS.length}
        title={strings.title}
      />
    </ErrorBoundary>
  )
}

export default IncomeAssistant
