/** @jest-environment jsdom */
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import IncomeAssistant from "../Income/IncomeAssistant"

describe("IncomeAssistant", () => {
  const mockOnClose = jest.fn()

  it("renders when isOpen is true", () => {
    render(<IncomeAssistant isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByTestId("chatbot-panel")).toBeInTheDocument()
  })

  it("does not render when isOpen is false", () => {
    render(<IncomeAssistant isOpen={false} onClose={mockOnClose} />)
    expect(screen.queryByTestId("chatbot-panel")).not.toBeInTheDocument()
  })

  it("calls onClose when minimize button is clicked", () => {
    render(<IncomeAssistant isOpen={true} onClose={mockOnClose} />)
    fireEvent.click(screen.getByTestId("minimize-button"))
    expect(mockOnClose).toHaveBeenCalled()
  })
})
