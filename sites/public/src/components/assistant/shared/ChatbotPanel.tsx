import React, { useEffect, useRef, useState } from "react"
import styles from "./ChatbotPanel.module.scss"
import { Message } from "../context/AssistantContext"
import ErrorBoundary from "./ErrorBoundary"

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
}) => {
  const [inputValue, setInputValue] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleUserInput = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    onSendMessage(inputValue.trim())
    setInputValue("")
  }

  return (
    <ErrorBoundary>
      <div className={styles.chatbotContainer}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>{title}</span>
          <button onClick={onMinimize} className={styles.minimizeButton}>
            &minus;
          </button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.type === "user" ? styles.messageUser : styles.messageBot}
            >
              <div className={msg.type === "assistant" ? styles.botBubble : styles.userBubble}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {currentStep < totalSteps && (
          <form onSubmit={handleUserInput} className={styles.inputContainer}>
            <input
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
        <div className={styles.submitContainer}>
          <button onClick={() => onStartOver()} className={styles.submitButton}>
            Start Over
          </button>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ChatbotPanel
