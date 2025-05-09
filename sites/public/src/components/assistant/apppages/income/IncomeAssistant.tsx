import React from "react"
import ChatbotContainer, { AssistantScript } from "../../shared/ChatbotContainer"
import ErrorBoundary from "../../shared/ErrorBoundary"
import type { AssistantQuestion } from "../../controller/AssistantController.types"

const INCOME_QUESTIONS: AssistantQuestion[] = [
  {
    id: "household_income",
    question: "How many people in your house earn an income?",
    type: "number",
    validation: (value: string) => {
      // Validates input is a number > 0
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    },
    // Handles dynamic question generation based on household income input.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dynamicQuestionHandler: (input: string, _responses: string[]): AssistantQuestion[] => {
      void _responses // Acknowledge unused _responses
      const questionsToAdd: AssistantQuestion[] = []
      const count = parseInt(input)
      // Limit dynamic questions to a reasonable number (e.g., 12 people)
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

const incomeAssistantScript: AssistantScript = {
  welcomeMessage: "Welcome! Let's calculate your income.",
  questions: INCOME_QUESTIONS,
  fallbackInvalid: "Invalid answer.",
  fallbackError: "Error processing responses.",

  // Provides the final calculation result and confirmation state.
  getFinalResult: (
    _responses: string[]
  ): { estimate: string; requiresConfirmation: boolean; finalMessage: string } | null => {
    const householdCount = parseInt(_responses[0], 10)
    const personCount = Math.min(isNaN(householdCount) ? 0 : householdCount, 12)

    // Determine the expected number of responses based on the initial household count.
    const expectedResponsesCount = 1 + personCount * 2

    // Ensure all required responses have been provided.
    if (_responses.length < expectedResponsesCount) {
      return {
        estimate: "",
        requiresConfirmation: false,
        finalMessage: "Please complete all responses before finalizing income.",
      }
    }

    let totalAnnualIncome = 0
    let validationError = false
    let validationErrorMessage = ""

    // Process hourly rate and hours per week for each person.
    for (let i = 0; i < personCount; i++) {
      const hourlyIndex = 1 + i * 2
      const hoursIndex = hourlyIndex + 1

      const hourlyRateStr = _responses[hourlyIndex]
      const hoursPerWeekStr = _responses[hoursIndex]

      // Parse and validate hourly rate.
      const hourlyRate = parseFloat(hourlyRateStr.replace(/[^0-9.]/g, ""))
      if (isNaN(hourlyRate) || hourlyRate <= 0) {
        validationError = true
        validationErrorMessage = `Please enter a valid hourly rate for person ${i + 1}.`
        break
      }

      // Parse and validate hours per week.
      const hoursPerWeek = parseFloat(hoursPerWeekStr)
      if (isNaN(hoursPerWeek) || hoursPerWeek <= 0 || hoursPerWeek > 168) {
        validationError = true
        validationErrorMessage = `Please enter a valid hours per week value for person ${i + 1}.`
        break
      }

      // Calculate and accumulate annual income for the current person.
      totalAnnualIncome += hourlyRate * hoursPerWeek * 52
    }

    // Return validation error message if any issues were found.
    if (validationError) {
      return {
        estimate: "",
        requiresConfirmation: false,
        finalMessage: validationErrorMessage,
      }
    } else {
      // Return the final calculated estimate and confirmation state.
      const formattedIncome = totalAnnualIncome.toLocaleString()
      const finalMessageText = `Thank you! Based on your inputs, your estimated annual income is $${formattedIncome}.`

      return {
        estimate: totalAnnualIncome.toString(),
        requiresConfirmation: true, // Confirmation is always required for this assistant.
        finalMessage: finalMessageText + " Confirm Estimate", // Appending for controller parsing convenience.
      }
    }
  },
}

interface IncomeAssistantProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: (estimate: string) => void
  _strings?: { title?: string }
}

const IncomeAssistant: React.FC<IncomeAssistantProps> = ({
  isOpen,
  onClose,
  onConfirm = (estimate: string) => {
    console.log("Confirmed final estimate:", estimate)
    alert(`Confirmed final estimate: $${estimate}`)
  },
  _strings,
}) => {
  // Render assistant only when open.
  return isOpen ? (
    <ErrorBoundary>
      {/* Container div for basic styling */}
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        {/* Chatbot component with income script */}
        <ChatbotContainer
          assistantScript={incomeAssistantScript}
          onMinimize={onClose}
          onConfirm={onConfirm}
        />
      </div>
    </ErrorBoundary>
  ) : null
}

export { IncomeAssistant }
export default IncomeAssistant
