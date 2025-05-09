/** @jest-environment jsdom */
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import IncomeAssistantComponent from "../apppages/income/IncomeAssistant"
import { AssistantProvider } from "../context/AssistantContext"

jest.mock("../../shared/ChatbotPanel", () => {
  return function ChatbotPanel(props) {
    return (
      <div data-testid="chatbot-panel">
        <button data-testid="minimize-button" onClick={props.onMinimize}>
          Minimize
        </button>
      </div>
    )
  }
})

describe("IncomeAssistant", () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders when open", () => {
    render(
      <AssistantProvider totalSteps={4}>
        <IncomeAssistantComponent isOpen={true} onClose={mockOnClose} />
      </AssistantProvider>
    )
    expect(screen.getByTestId("chatbot-panel")).toBeInTheDocument()
  })

  test("does not render when closed", () => {
    render(
      <AssistantProvider totalSteps={4}>
        <IncomeAssistantComponent isOpen={false} onClose={mockOnClose} />
      </AssistantProvider>
    )
    expect(screen.queryByTestId("chatbot-panel")).toBeNull()
  })

  test("calls onClose when minimize button is clicked", () => {
    render(
      <AssistantProvider totalSteps={4}>
        <IncomeAssistantComponent isOpen={true} onClose={mockOnClose} />
      </AssistantProvider>
    )
    fireEvent.click(screen.getByTestId("minimize-button"))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
