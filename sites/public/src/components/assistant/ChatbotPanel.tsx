import React, { useEffect, useRef, useState } from "react"
import { ChatbotPanelProps } from "./types"
import styles from "./ChatbotPanel.module.scss"

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
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [messages, isProcessing])

  const handleUserInput = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    onSendMessage(inputValue.trim())
    setInputValue("")
    inputRef.current?.focus()
  }

  const showInput =
    pureLLMMode ||
    (currentStep < totalSteps &&
      (!customButtonText ||
        (customButtonText !== "Confirm Estimate" &&
          customButtonText !== "Switch to Pure LLM Mode")))

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>{pureLLMMode ? "AI Assistant" : title}</span>
        <button onClick={onMinimize} className={styles.minimizeButton}>
          &minus;
        </button>
      </div>

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
        <div ref={chatEndRef} />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showInput && (
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

      {showSwitchLLMButton && onSwitchLLMMode && (
        <div className={styles.switchLLMContainer}>
          <button onClick={onSwitchLLMMode} className={styles.switchLLMButton}>
            Switch to Pure LLM Mode
          </button>
        </div>
      )}

      {customButtonText && onCustomButtonClick && (
        <div className={styles.customButtonContainer}>
          <button onClick={onCustomButtonClick} className={styles.customButton}>
            {customButtonText}
          </button>
        </div>
      )}

      <div className={styles.submitContainer}>
        <button onClick={onStartOver} disabled={isProcessing} className={styles.submitButton}>
          Start Over
        </button>
      </div>
    </div>
  )
}

export default ChatbotPanel
