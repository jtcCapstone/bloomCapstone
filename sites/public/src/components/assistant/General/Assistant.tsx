import React from "react"
import { useRouter } from "next/router"
import { GeneralAssistantProps } from "../types"
import ChatbotContainer from "../ChatbotContainer"
import ErrorBoundary from "../ErrorBoundary"
import { getScriptForPage } from "../scripts/generalScript"

const Assistant: React.FC<GeneralAssistantProps> = ({
  isOpen,
  onClose,
  onConfirm = (estimate: string) => {
    const cleanEstimate = estimate.replace(/[^0-9.]/g, "")
    onConfirm(cleanEstimate)
  },
  _strings,
}) => {
  const router = useRouter()
  const assistantScript = getScriptForPage(router.pathname)

  return isOpen ? (
    <ErrorBoundary>
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <ChatbotContainer
          assistantScript={assistantScript}
          onMinimize={onClose}
          onConfirm={onConfirm}
        />
      </div>
    </ErrorBoundary>
  ) : null
}

export default Assistant
