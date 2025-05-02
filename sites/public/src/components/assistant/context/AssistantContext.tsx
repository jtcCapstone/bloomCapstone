import React, { createContext, useContext, useReducer, ReactNode, useRef } from "react"
import { sendChatMessage } from "../chatService"

// Types
export interface Message {
  id: string
  content: string
  type: "user" | "assistant"
  timestamp: Date
}

interface AssistantState {
  messages: Message[]
  isProcessing: boolean
  currentStep: number
  totalSteps: number
  error: string | null
  isOpen: boolean
}

type AssistantAction =
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "RESET" }

interface AssistantContextType {
  state: AssistantState
  sendMessage: (content: string, type?: "user" | "assistant") => void
  setStep: (step: number) => void
  setError: (error: string | null) => void
  setOpen: (isOpen: boolean) => void
  reset: () => void
}

// Initial state
const initialState: AssistantState = {
  messages: [],
  isProcessing: false,
  currentStep: 0,
  totalSteps: 0,
  error: null,
  isOpen: false,
}

// Reducer
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

// Context
const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

// Provider
interface AssistantProviderProps {
  children: ReactNode
  totalSteps: number
}

export const AssistantProvider: React.FC<AssistantProviderProps> = ({ children, totalSteps }) => {
  const [state, dispatch] = useReducer(assistantReducer, { ...initialState, totalSteps })
  const messageCounter = useRef(0)

  const sendMessage = async (content: string, type: "user" | "assistant" = "user") => {
    const message: Message = {
      id: `${Date.now()}-${messageCounter.current++}`,
      content,
      type,
      timestamp: new Date(),
    }
    dispatch({ type: "ADD_MESSAGE", payload: message })

    // If the message is from the user, send it to the LLM
    if (type === 'user'){
      dispatch({ type:'SET_PROCESSING', payload:true})

      try {
        // history is the array of messages from the user
        const history = state.messages.map(msg =>msg.content)

        // send message to llm and wait for response
        const response = await sendChatMessage(content,history)

        const assistantMessage: Message = {
          id: `${Date.now()}-${messageCounter.current++}`,
          content: response,
          type: 'assistant',
          timestamp: new Date(),
        }

        dispatch({ type:'ADD_MESSAGE', payload:assistantMessage})
        // catch any errors from the LLM
      } catch (error){
        console.error("Error getting response from LLM: ", error)
        dispatch({ type:'SET_ERROR', payload: 'Failed to get response'})
      } finally {
        dispatch({ type:'SET_PROCESSING', payload:false})
      }
    }
  }

  const setStep = (step: number) => {
    dispatch({ type: "SET_STEP", payload: step })
  }

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }

  const setOpen = (isOpen: boolean) => {
    dispatch({ type: "SET_OPEN", payload: isOpen })
  }

  const reset = () => {
    dispatch({ type: "RESET" })
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
      }}
    >
      {children}
    </AssistantContext.Provider>
  )
}

// Hook
export const useAssistant = () => {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error("useAssistant must be used within an AssistantProvider")
  }
  return context
}
