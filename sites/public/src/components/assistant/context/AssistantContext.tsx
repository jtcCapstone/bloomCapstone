/*
  AssistantContext.tsx
  ===================
  Provides context and state management for the assistant chatbot.
*/

import React, { createContext, useContext, useReducer, ReactNode, useRef } from "react"
import { sendLLMMessage } from "../shared/ChatLlmService"
import { ChatMessage } from "../controller/AssistantController.types"

// Defines the structure of the assistant state.
interface AssistantState {
  messages: ChatMessage[]
  isProcessing: boolean
  currentStep: number
  totalSteps: number
  error: string | null
  isOpen: boolean
}

// Defines possible actions to modify the assistant state.
type AssistantAction =
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "RESET" }

// Defines the context value provided by the AssistantProvider.
interface AssistantContextType {
  state: AssistantState
  sendMessage: (content: string, type?: "user" | "assistant") => void
  setStep: (step: number) => void
  setError: (error: string | null) => void
  setOpen: (isOpen: boolean) => void
  reset: () => void
  initializeAssistant: (initialMessage: string) => void
}

const initialState: AssistantState = {
  messages: [],
  isProcessing: false,
  currentStep: 0,
  totalSteps: 0,
  error: null,
  isOpen: false,
}

// Reducer function to update the assistant state.
const assistantReducer = (state: AssistantState, action: AssistantAction): AssistantState => {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload }
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload }
    case "SET_STEP":
      return { ...state, currentStep: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_OPEN":
      return { ...state, isOpen: action.payload }
    case "RESET":
      return initialState
    default:
      return state
  }
}

// Create the AssistantContext.
const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

// Props for the AssistantProvider component.
interface AssistantProviderProps {
  children: ReactNode
  totalSteps: number
}

// Provides the assistant state and functions via context.
export const AssistantProvider: React.FC<AssistantProviderProps> = ({ children, totalSteps }) => {
  const [state, dispatch] = useReducer(assistantReducer, { ...initialState, totalSteps })
  const messageCounter = useRef(0) // Used for unique message IDs

  // Adds a message to the conversation and optionally sends user messages to the LLM.
  const sendMessage = async (content: string, type: "user" | "assistant" = "user") => {
    const message: ChatMessage = {
      id: `${Date.now()}-${messageCounter.current++}`,
      content,
      sender: "user", // Messages sent via this function are always from the user
      timestamp: new Date(),
    }
    dispatch({ type: "ADD_MESSAGE", payload: message })

    if (type === "user") {
      dispatch({ type: "SET_PROCESSING", payload: true })
      try {
        const history = state.messages.map((msg) => msg.content)
        const response = await sendLLMMessage(content, history)
        const assistantMessage: ChatMessage = {
          id: `${Date.now()}-${messageCounter.current++}`,
          content: response,
          sender: "assistant",
          timestamp: new Date(),
        }
        dispatch({ type: "ADD_MESSAGE", payload: assistantMessage })
      } catch (error) {
        console.error("Error getting response from LLM: ", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to get response" })
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false })
      }
    }
  }

  // Updates the current step in the conversation.
  const setStep = (step: number) => {
    dispatch({ type: "SET_STEP", payload: step })
  }

  // Sets an error message in the state.
  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }

  // Toggles the open/closed state of the assistant.
  const setOpen = (isOpen: boolean) => {
    dispatch({ type: "SET_OPEN", payload: isOpen })
  }

  // Resets the entire state to initial values.
  const reset = () => {
    dispatch({ type: "RESET" })
  }

  // Initializes the conversation with a welcome message.
  const initializeAssistant = (initialMessage: string) => {
    const message: ChatMessage = {
      id: `${Date.now()}-${messageCounter.current++}`,
      content: initialMessage,
      sender: "assistant", // Initial message is from the assistant
      timestamp: new Date(),
    }
    dispatch({ type: "SET_MESSAGES", payload: [message] })
  }

  return (
    <AssistantContext.Provider
      value={{
        state,
        sendMessage,
        setStep,
        setError,
        setOpen,
        reset,
        initializeAssistant,
      }}
    >
      {children}
    </AssistantContext.Provider>
  )
}

// Custom hook to consume the AssistantContext.
export const useAssistant = () => {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error("useAssistant must be used within an AssistantProvider")
  }
  return context
}
