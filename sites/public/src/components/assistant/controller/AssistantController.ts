/*
  AssistantController.ts
  ======================
  Manages the conversation flow and state for the chatbot.
*/

import { sendLLMMessage } from "../shared/ChatLlmService"
import {
  ChatMessage,
  AssistantQuestion,
  AssistantController as AssistantControllerType,
} from "./AssistantController.types"

// Defines the script structure for driving the assistant conversation.
interface AssistantScript {
  welcomeMessage: string
  questions: AssistantQuestion[]
  fallbackInvalid: string
  fallbackError: string
  // Optional function to determine the final result and confirmation state based on responses.
  getFinalResult?: (responses: string[]) => {
    estimate: string
    requiresConfirmation: boolean
    finalMessage: string
  } | null
}

// Defines the public interface for the AssistantController.
export interface AssistantController {
  /** Initializes the conversation state. */
  initialize(): Promise<void>
  /** Returns the current step index in the conversation flow. */
  getCurrentStep(): number
  /** Processes user input, updates state, and adds messages. */
  sendMessage(input: string): Promise<void>
  /** Returns the current array of conversation messages. */
  getMessages(): ChatMessage[]
  /** Resets the conversation to its initial state. */
  startOver(): Promise<void>
  /** Toggles between script logic mode and pure LLM mode. */
  switchLLMMode(): void
  /** Returns the raw final estimate value from the script's getFinalResult. */
  getFinalEstimate(): string
  /** Indicates if the conversation is ready for confirmation (based on script result). */
  isConfirmReady(): boolean
  /** Returns the current LLM mode (true for pure LLM mode). */
  isPureLlmMode(): boolean
  /** Returns the total count of questions in the current flow, including dynamic ones. */
  getCurrentQuestionsCount(): number
}

export const createAssistantController = (script: AssistantScript): AssistantControllerType => {
  // Controller's internal state variables.
  let currentStep = 0
  const responses: string[] = [] // Stores user inputs for script finalization
  let pureLlmMode = false
  let invalidInputCount = 0
  let invalidInputs: string[] = []
  let currentQuestions: AssistantQuestion[] = [] // Dynamic list of active questions

  // State synced with the UI layer.
  let messages: ChatMessage[] = []
  let finalEstimate = ""
  let confirmReady = false

  // Handles user input processing based on the script's question logic.
  // Manages validation, dynamic questions, and fallback responses.
  const handleUserInputLogic = async (
    input: string
  ): Promise<{ responseText: string; flowEnded: boolean }> => {
    const question = currentQuestions[currentStep]
    let responseText = ""

    if (question && typeof question.validation === "function") {
      const isValid = question.validation(input)
      if (!isValid) {
        invalidInputCount++
        invalidInputs.push(input)
        if (invalidInputCount < 2) {
          responseText = script.fallbackInvalid
        } else {
          // After two invalid inputs, use LLM for clarification
          const combinedPrompt = `User provided the following invalid responses: ${invalidInputs
            .slice(-2)
            .join(", ")}. Please help interpret or clarify the intended response.`
          const llmResponse = await sendLLMMessage(combinedPrompt, [...responses])
          responseText = llmResponse
          invalidInputCount = 0 // Reset after LLM intervention
          invalidInputs = []
        }
      } else {
        // Valid input received
        responses.push(input)

        // Process dynamic question generation if handler exists
        if (question.dynamicQuestionHandler) {
          const newQuestions = question.dynamicQuestionHandler(input, responses)
          if (newQuestions && newQuestions.length > 0) {
            currentQuestions = [...currentQuestions, ...newQuestions]
          }
        }

        currentStep++ // Move to the next step

        // Determine the next assistant message text
        if (currentQuestions && currentStep < currentQuestions.length) {
          responseText = currentQuestions[currentStep].question
        } else {
          return { responseText: "", flowEnded: true } // Signal end of script flow
        }
      }
    } else {
      // No validation needed or question not found, treat as accepted
      responses.push(input)
      currentStep++
      if (currentQuestions && currentStep < currentQuestions.length) {
        responseText = currentQuestions[currentStep].question
      } else {
        return { responseText: "", flowEnded: true } // Signal end of script flow
      }
    }

    return { responseText, flowEnded: false }
  }

  // Handles user input processing in pure LLM mode.
  // Sends input to the LLM service and returns the response.
  const handleUserInputLLM = async (input: string): Promise<string> => {
    const llmResponse = await sendLLMMessage(input, responses)
    currentStep++ // Increment step loosely in LLM mode
    invalidInputCount = 0 // Reset after LLM handled
    invalidInputs = []
    return llmResponse
  }

  // Resets the controller state and initializes the conversation.
  const initialize = async (): Promise<void> => {
    currentStep = 0
    responses.splice(0, responses.length)
    pureLlmMode = false
    invalidInputCount = 0
    invalidInputs = []
    messages = []
    finalEstimate = ""
    confirmReady = false
    currentQuestions = [...script.questions] // Start with initial script questions

    // Add welcome message and first question
    const initMsgText = `${script.welcomeMessage}\n${
      currentQuestions && currentQuestions.length > 0 ? currentQuestions[0].question : ""
    }`
    messages.push({
      id: `${Date.now()}`,
      content: initMsgText,
      sender: "assistant",
      timestamp: new Date(),
    })

    await Promise.resolve() // Maintain async signature
  }

  // Processes a user's message through either script logic or LLM.
  // Updates internal state and checks for finalization.
  const sendMessage = async (input: string): Promise<void> => {
    // Reset confirmation state from previous turn
    confirmReady = false
    finalEstimate = ""

    // Add user message
    messages.push({ id: `${Date.now()}`, content: input, sender: "user", timestamp: new Date() })

    let assistantResponseText = ""
    let flowEnded = false

    // Process input based on current mode
    if (pureLlmMode) {
      assistantResponseText = await handleUserInputLLM(input)
      // flowEnded remains false in pure LLM mode after input processing
    } else {
      const logicResult = await handleUserInputLogic(input)
      assistantResponseText = logicResult.responseText
      flowEnded = logicResult.flowEnded
    }

    // Handle finalization if script logic flow ended and getFinalResult exists
    if (!pureLlmMode && flowEnded && script.getFinalResult) {
      const finalResult = script.getFinalResult(responses)
      if (finalResult) {
        finalEstimate = finalResult.estimate
        confirmReady = finalResult.requiresConfirmation
        assistantResponseText = finalResult.finalMessage
      } else {
        // Finalization failed or not ready, revert step
        assistantResponseText = script.fallbackError || "Could not finalize the result."
        if (currentStep > 0) currentStep--
      }
    } else if (!pureLlmMode && flowEnded && !script.getFinalResult) {
      // Flow ended but no finalization function provided
      assistantResponseText = "Assistant finished (no finalization logic)."
      finalEstimate = ""
      confirmReady = false
      if (currentStep > 0) currentStep--
    }
    // If pureLlmMode is true and flowEnded is true, getFinalResult is NOT called.

    // Add the determined assistant message
    messages.push({
      id: `${Date.now()}`,
      content: assistantResponseText,
      sender: "assistant",
      timestamp: new Date(),
    })

    // Internal state (messages, currentStep, pureLlmMode, finalEstimate, confirmReady) updated.
  }

  // Resets the conversation state by calling initialize.
  const startOver = async (): Promise<void> => {
    await initialize()
  }

  // Toggles pure LLM mode and adds a system message.
  // Resets confirmation state.
  const switchLLMMode = (): void => {
    pureLlmMode = !pureLlmMode
    messages.push({
      id: `${Date.now()}`,
      content: `Switched to ${pureLlmMode ? "Pure LLM" : "Logic"} Mode.`,
      sender: "assistant",
      timestamp: new Date(),
    })
    // Switching mode invalidates any pending confirmation
    confirmReady = false
    finalEstimate = ""
  }

  // Public getter methods.
  const getCurrentStep = () => currentStep
  const getMessages = (): ChatMessage[] => messages
  const getFinalEstimate = (): string => finalEstimate
  const isConfirmReady = (): boolean => confirmReady
  const isPureLlmMode = (): boolean => pureLlmMode
  const getCurrentQuestionsCount = () => currentQuestions.length

  return {
    initialize,
    getCurrentStep,
    sendMessage,
    startOver,
    switchLLMMode,
    getMessages,
    getFinalEstimate,
    isConfirmReady,
    isPureLlmMode,
    getCurrentQuestionsCount,
  }
}
