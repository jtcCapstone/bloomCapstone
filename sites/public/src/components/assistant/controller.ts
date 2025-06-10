import axios from "axios"
import { AssistantScript, ChatMessage, AssistantQuestion } from "./types"

export const sendLLMMessage = async (message: string, history: string[] = []): Promise<string> => {
  try {
    const response = await axios.post<{ response: string }>(
      `${process.env.NEXT_PUBLIC_BACKEND_API_BASE || "http://localhost:3100"}/llm/chat`,
      { message, history },
      { headers: { "Content-Type": "application/json" } }
    )
    return response.data.response
  } catch (error) {
    console.error("Error sending chat message:", error)
    return "Sorry, I encountered an issue processing your request."
  }
}

export const createAssistantController = (script: AssistantScript) => {
  let currentStep = 0
  const responses: string[] = []
  let pureLlmMode = !script.questions?.length // Start in LLM mode if no questions
  let invalidInputCount = 0
  let invalidInputs: string[] = []
  let currentQuestions: AssistantQuestion[] = []
  let messages: ChatMessage[] = []
  let finalEstimate = ""
  let confirmReady = false
  let validResponses: { [key: number]: string } = {}

  const handleUserInputLogic = async (
    input: string
  ): Promise<{ responseText: string; flowEnded: boolean }> => {
    const question = currentQuestions[currentStep]
    let responseText = ""

    if (question?.validation) {
      const isValid = question.validation(input)

      if (!isValid) {
        invalidInputCount++
        invalidInputs.push(input)

        if (invalidInputCount >= 2) {
          const llmResponse = await sendLLMMessage(
            `User provided invalid responses: ${invalidInputs
              .slice(-2)
              .join(", ")}. Please help interpret.`,
            Object.values(validResponses)
          )
          responseText = llmResponse
          invalidInputCount = 0
          invalidInputs = []
        } else {
          //  Use specific invalid message if available
          responseText = question.invalidMessage || script.fallbackInvalid
        }

        return { responseText, flowEnded: false }
      } else {
        validResponses[currentStep] = input
        invalidInputCount = 0
        invalidInputs = []

        if (question.dynamicQuestionHandler) {
          currentQuestions = [
            ...currentQuestions,
            ...question.dynamicQuestionHandler(input, Object.values(validResponses)),
          ]
        }

        currentStep++
        return currentStep < currentQuestions.length
          ? { responseText: currentQuestions[currentStep].question, flowEnded: false }
          : { responseText: "", flowEnded: true }
      }
    }

    return { responseText: "An error occurred", flowEnded: false }
  }

  const initialize = (): void => {
    currentStep = 0
    responses.splice(0)
    pureLlmMode = !script.questions?.length // Maintain LLM mode on reinitialize
    invalidInputCount = 0
    invalidInputs = []
    messages = []
    finalEstimate = ""
    confirmReady = false
    validResponses = {}
    currentQuestions = script.questions ? [...script.questions] : []

    // Only add initial message if not in pure LLM mode
    if (!pureLlmMode && currentQuestions[0]) {
      messages.push({
        id: `${Date.now()}`,
        content: `${script.welcomeMessage}\n${currentQuestions[0].question}`,
        sender: "assistant",
        timestamp: new Date(),
      })
    }
  }

  const getFinalResult = () =>
    validResponses && script.getFinalResult?.(Object.values(validResponses))

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
