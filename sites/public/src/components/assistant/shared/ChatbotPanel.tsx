/*
  ChatbotPanel.tsx
  ==============
  Renders the chatbot user interface.
*/

import React, { useEffect, useRef, useState } from "react"
import styles from "./ChatbotPanel.module.scss"
import { ChatMessage as Message } from "../controller/AssistantController.types" // Import message type
import ErrorBoundary from "./ErrorBoundary"

// Props for the ChatbotPanel component.
interface ChatbotPanelProps {
  onMinimize: () => void
  messages: Message[]
  isProcessing: boolean
  onSendMessage: (message: string) => void
  onStartOver: () => void
  error: string | null
  currentStep: number
  totalSteps: number
  title?: string
  showSwitchLLMButton?: boolean
  onSwitchLLMMode?: () => void
  customButtonText?: string
  onCustomButtonClick?: () => void
  pureLLMMode?: boolean
}

const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  onMinimize,
  messages,
  isProcessing,
  onSendMessage,
  onStartOver,
  error,
  currentStep,
  totalSteps,
  title = "Assistant",
  showSwitchLLMButton,
  onSwitchLLMMode,
  customButtonText,
  onCustomButtonClick,
  pureLLMMode,
}) => {
  const [inputValue, setInputValue] = useState("") // State for the current input value
  const inputRef = useRef<HTMLInputElement>(null) // Ref for the input element
  const chatEndRef = useRef<HTMLDivElement>(null) // Ref for auto-scrolling

  // Scrolls the chat messages to the bottom.
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Scrolls to bottom when messages update.
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focuses the input field when messages update or processing stops.
  useEffect(() => {
    inputRef.current?.focus()
  }, [messages, isProcessing])

  // Handles the form submission for user input.
  const handleUserInput = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return // Prevent sending empty messages
    onSendMessage(inputValue.trim()) // Send message via prop callback
    setInputValue("") // Clear input
    inputRef.current?.focus() // Refocus input
  }

  return (
    <ErrorBoundary>
      <div className={styles.chatbotContainer}>
        {/* Header: Title and Minimize button */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>{title}</span>
          <button onClick={onMinimize} className={styles.minimizeButton}>
            &minus;
          </button>
        </div>

        {/* Message Display Area */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.sender === "user" ? styles.messageUser : styles.messageBot}
            >
              <div className={msg.sender === "assistant" ? styles.botBubble : styles.userBubble}>
                {msg.content}
              </div>
            </div>
          ))}
          {/* Scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Error Message Display */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Input Form (visible if in LLM mode or conversation is ongoing) */}
        {(pureLLMMode || currentStep < totalSteps) && (
          <form onSubmit={handleUserInput} className={styles.inputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.textInput}
              placeholder="Type your answer..."
              disabled={isProcessing}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim() || isProcessing}
            >
              {isProcessing ? "Processing..." : "Send"}
            </button>
          </form>
        )}

        {/* Optional Pure LLM Mode Switch Button */}
        {showSwitchLLMButton && onSwitchLLMMode && (
          <div className={styles.switchLLMContainer} style={{ margin: "1rem 0" }}>
            <button onClick={onSwitchLLMMode} className={styles.switchLLMButton}>
              Switch to Pure LLM Mode
            </button>
          </div>
        )}

        {/* Optional Custom Action Button */}
        {customButtonText && onCustomButtonClick && (
          <div className={styles.customButtonContainer} style={{ margin: "1rem 0" }}>
            <button onClick={onCustomButtonClick} className={styles.customButton}>
              {customButtonText}
            </button>
          </div>
        )}

        {/* Start Over Button */}
        <div className={styles.submitContainer}>
          <button
            onClick={() => {
              console.log("ChatbotPanel: Start Over clicked") // Log action
              onStartOver() // Call handler
            }}
            disabled={isProcessing}
            className={styles.submitButton}
          >
            Start Over
          </button>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ChatbotPanel
