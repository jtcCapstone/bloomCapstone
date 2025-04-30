import React, { Component, ErrorInfo, ReactNode } from "react"
import { t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import styles from "./ErrorBoundary.module.scss"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles["error-boundary"]}>
          <h2>{t("errors.somethingWentWrong")}</h2>
          <p>{t("errors.tryAgain")}</p>
          <Button variant="primary" onClick={this.handleReset}>
            {t("t.tryAgain")}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
