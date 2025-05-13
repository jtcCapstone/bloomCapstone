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
      return (
        <div className={styles.errorContainer}>
          <h2>Something went wrong.</h2>
          {this.state.error && (
            <pre className={styles.errorMessage}>{this.state.error.message}</pre>
          )}
          <button onClick={this.handleReset}>Try Again</button>
        </div>
      )
    }

    return this.props.children as React.ReactNode
  }
}

export default ErrorBoundary
