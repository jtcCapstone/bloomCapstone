import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { IncomeAssistant } from "../IncomeAssistant"
import { AssistantProvider } from "../../context/AssistantContext"

// Simple mock for ChatbotPanel
jest.mock("../../shared/ChatbotPanel", () => ({
  __esModule: true,
  default: ({ onMinimize, title }) => (
    <div data-testid="chatbot-panel">
      <div data-testid="title">{title}</div>
      <button data-testid="minimize-button" onClick={onMinimize}>
        Minimize
      </button>
    </div>
  ),
}))

describe("IncomeAssistant", () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders when open", () => {
    render(
      <AssistantProvider totalSteps={4}>
        <IncomeAssistant isOpen={true} onClose={mockOnClose} />
      </AssistantProvider>
    )
    expect(screen.getByTestId("chatbot-panel")).toBeInTheDocument()
  })

  it("shows correct title", () => {
    render(
      <AssistantProvider totalSteps={4}>
        <IncomeAssistant isOpen={true} onClose={mockOnClose} />
      </AssistantProvider>
    )
    expect(screen.getByTestId("title")).toHaveTextContent("Income Assistant")
  })

  it("doesn't render when closed", () => {
    render(
      <AssistantProvider totalSteps={4}>
        <IncomeAssistant isOpen={false} onClose={mockOnClose} />
      </AssistantProvider>
    )
    expect(screen.queryByTestId("chatbot-panel")).not.toBeInTheDocument()
  })

  it("calls onClose when minimized", () => {
    render(
      <AssistantProvider totalSteps={4}>
        <IncomeAssistant isOpen={true} onClose={mockOnClose} />
      </AssistantProvider>
    )
    fireEvent.click(screen.getByTestId("minimize-button"))
    expect(mockOnClose).toHaveBeenCalled()
  })
})
