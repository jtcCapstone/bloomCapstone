import React from "react"
import { IncomeAssistantProps } from "../types"
import ChatbotContainer from "../ChatbotContainer"
import ErrorBoundary from "../ErrorBoundary"
import { incomeAssistantScript } from "../scripts/incomeScript"

const IncomeAssistant: React.FC<IncomeAssistantProps> = ({
  isOpen,
  onClose,
  onConfirm = (estimate: string) => {
    const cleanEstimate = estimate.replace(/[^0-9.]/g, "")
    onConfirm(cleanEstimate)
  },
  _strings,
}) => {
  return isOpen ? (
    <ErrorBoundary>
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <ChatbotContainer
          assistantScript={incomeAssistantScript}
          onMinimize={onClose}
          onConfirm={onConfirm}
        />
      </div>
    </ErrorBoundary>
  ) : null
}

export default IncomeAssistant
