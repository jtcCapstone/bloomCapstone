import React, { useEffect, useRef, useState } from "react"
import styles from "./ChatbotPanel.module.scss"

interface Message {
  sender: "bot" | "user"
  text: string
}

const questions = [
  "How many people in your house earn an income?",
  "How much do you make per hour?",
  "How many hours a week do you usually work?",
  "Do you have any other form of verifiable income?",
]

const ChatbotPanel = ({ onMinimize }: { onMinimize: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Welcome! This part of the application is where applicants often struggle the most. Completing this section accurately can help your application be processed faster, which could help you get housing sooner! Let's get started.",
    },
    { sender: "bot", text: questions[0] },
  ])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [answers, setAnswers] = useState<string[]>([])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleUserInput = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    const newMessages: Message[] = [...messages, { sender: "user", text: inputValue.trim() }]

    const nextQuestionIndex = currentQuestionIndex + 1

    if (nextQuestionIndex < questions.length) {
      newMessages.push({ sender: "bot", text: questions[nextQuestionIndex] })
    } else {
      newMessages.push({ sender: "bot", text: "All done! Click Submit below to finish." })
    }

    setMessages(newMessages)

    setAnswers((prevAnswers) => [...prevAnswers, inputValue.trim()])

    setCurrentQuestionIndex(nextQuestionIndex)
    setInputValue("")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const payload = questions.map((question, index) => ({
        question,
        answer: answers[index] || "",
      }))
      // Replace with actual API endpoint
      await fetch("/api/your-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      setResult("Submission successful!") // need to replace with actual result
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.chatbotContainer}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>Assistant</span>
        <button onClick={onMinimize} className={styles.minimizeButton}>
          &minus;
        </button>
      </div>

      {/* Chat Messages */}
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "user" ? styles.messageUser : styles.messageBot}
          >
            <div className={msg.sender === "bot" ? styles.botBubble : styles.userBubble}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input or Submit */}
      {!result && currentQuestionIndex < questions.length ? (
        <form onSubmit={handleUserInput} className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={styles.textInput}
            placeholder="Type your answer..."
          />
          <button type="submit" className={styles.sendButton} disabled={!inputValue.trim()}>
            Send
          </button>
        </form>
      ) : (
        !result && (
          <div className={styles.submitContainer}>
            <button onClick={handleSubmit} className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        )
      )}

      {/* Result */}
      {result && (
        <div className={styles.resultContainer}>
          <p className={styles.resultTitle}>Here's your estimated income:</p>
          <p className={styles.resultValue}>{result}</p>
        </div>
      )}
    </div>
  )
}

export default ChatbotPanel
