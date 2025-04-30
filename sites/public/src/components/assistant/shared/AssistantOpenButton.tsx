import React from "react"
import styles from "./AssistantOpenButton.module.scss"

interface AssistantOpenButtonProps {
  onClick: () => void
  title?: string
}

const AssistantOpenButton: React.FC<AssistantOpenButtonProps> = ({
  onClick,
  title = "Need Help?",
}) => (
  <button className={styles.openButton} onClick={onClick}>
    {title}
  </button>
)

export default AssistantOpenButton
