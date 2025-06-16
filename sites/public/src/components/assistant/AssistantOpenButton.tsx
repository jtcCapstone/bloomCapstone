import React, { useState } from "react"
import styles from "./AssistantOpenButton.module.scss"
//import SVGIcon from "./logo_glyph.svg" // if using as an imported component, otherwise paste inline

interface AssistantOpenButtonProps {
  onClick: () => void
}

const AssistantOpenButton: React.FC<AssistantOpenButtonProps> = ({ onClick }) => {
  const [seen, setSeen] = useState(false)

  const handleClick = () => {
    setSeen(true)
    onClick()
  }

  return (
    <button className={styles.openButton} onClick={handleClick} aria-label="Open chat assistant">
      {!seen && <span className={styles.notificationBadge}>1</span>}
      <img className={styles.icon} src="/images/logo_glyph.svg" alt="Assistant Icon" />
    </button>
  )
}

export default AssistantOpenButton
