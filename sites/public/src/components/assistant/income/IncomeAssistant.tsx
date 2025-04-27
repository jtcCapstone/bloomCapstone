import React from "react"
import { IncomeAssistantProps } from "./IncomeAssistant.types"
import styles from "./IncomeAssistant.module.scss"

export const IncomeAssistant: React.FC<IncomeAssistantProps> = ({
  isOpen,
  onClose: _onClose,
  strings: _strings,
  messages: _messages,
  isProcessing: _isProcessing,
  onSendMessage: _onSendMessage,
  currentStep: _currentStep,
  totalSteps: _totalSteps,
  children,
}) => {
  if (!isOpen) return null

  return (
    <div className={styles.incomeAssistant} data-testid="income-assistant">
      {children}
    </div>
  )
}
