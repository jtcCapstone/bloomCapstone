import React from "react"
import styles from "./AssistantOpenButton.module.scss"

const AssistantOpenButton = ({ onClick }: { onClick: () => void }) => (
  <button className={styles.openButton} onClick={onClick}>
    Need Help?
  </button>
)

export default AssistantOpenButton
