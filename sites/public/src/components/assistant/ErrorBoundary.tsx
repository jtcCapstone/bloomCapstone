import React, { Component, ErrorInfo, ReactNode } from "react"
import type { ErrorBoundaryProps, ErrorBoundaryState } from "./types"
import styles from "./ErrorBoundary.module.scss"

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Check for specific error types
      const isConnectionError =
        this.state.error?.message?.includes("ETIMEDOUT") ||
        this.state.error?.message?.includes("connect")

      return (
        <div className={styles.errorContainer}>
          <h2>
            {isConnectionError
              ? "AI Assistant Unavailable"
              : "Something went wrong with the Assistant"}
          </h2>
          <p className={styles.errorMessage}>
            {isConnectionError
              ? "The AI service is currently unavailable. This might be temporary - please try again in a few moments."
              : "We encountered an unexpected error. Please try refreshing the page."}
          </p>
          <div className={styles.buttonContainer}>
            <button onClick={this.handleReset} className={styles.retryButton}>
              Try Again
            </button>
            {isConnectionError && (
              <button onClick={() => window.location.reload()} className={styles.refreshButton}>
                Refresh Page
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children as React.ReactNode
  }
}

export default ErrorBoundary
