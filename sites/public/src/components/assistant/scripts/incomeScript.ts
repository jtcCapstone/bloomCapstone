import { AssistantQuestion, AssistantScript } from "../types"

const INCOME_QUESTIONS: AssistantQuestion[] = [
  {
    id: "household_income",
    question: "How many people in your house earn an income?",
    type: "number",
    validation: (value: string) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    },
    dynamicQuestionHandler: (input: string) => {
      const questionsToAdd: AssistantQuestion[] = []
      const count = parseInt(input)
      const personCount = isNaN(count) || count < 1 ? 1 : Math.min(count, 12)

      for (let i = 0; i < personCount; i++) {
        questionsToAdd.push(
          {
            id: `hourly_rate_${i + 1}`,
            question: `For person ${i + 1}, how much do you make per hour?`,
            type: "currency",
            validation: (value: string) => {
              const cleaned = value.replace(/[$,]/g, "")
              return /^[0-9]+(\.[0-9]+)?$/.test(cleaned) && parseFloat(cleaned) > 0
            },
          },
          {
            id: `hours_per_week_${i + 1}`,
            question: `For person ${i + 1}, how many hours a week do you usually work?`,
            type: "number",
            validation: (value: string) => {
              const num = parseInt(value)
              return !isNaN(num) && num > 0 && num <= 168
            },
          }
        )
      }
      return questionsToAdd
    },
  },
]

export const incomeAssistantScript: AssistantScript = {
  welcomeMessage: "Welcome! Let's calculate your income.",
  questions: INCOME_QUESTIONS,
  fallbackInvalid: "Invalid answer.",
  fallbackError: "Error processing responses.",
  getFinalResult: (responses: string[]) => {
    const householdCount = parseInt(responses[0], 10)
    if (isNaN(householdCount) || householdCount <= 0) {
      return {
        estimate: "0",
        requiresConfirmation: false,
        finalMessage: "Invalid household count provided.",
      }
    }

    let totalAnnualIncome = 0
    for (let i = 0; i < householdCount; i++) {
      const hourlyRateStr = responses[1 + i * 2]
      const hoursPerWeekStr = responses[2 + i * 2]

      const hourlyRate = parseFloat(hourlyRateStr.replace(/[^0-9.]/g, ""))
      const hoursPerWeek = parseFloat(hoursPerWeekStr)

      if (!isNaN(hourlyRate) && !isNaN(hoursPerWeek)) {
        totalAnnualIncome += hourlyRate * hoursPerWeek * 52
      }
    }

    return {
      estimate: totalAnnualIncome.toString(),
      requiresConfirmation: true,
      finalMessage: `Thank you! Based on your inputs, your estimated annual income is $${totalAnnualIncome.toLocaleString()}. Confirm Estimate`,
    }
  },
}
