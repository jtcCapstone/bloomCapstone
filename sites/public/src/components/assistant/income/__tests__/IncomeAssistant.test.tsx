import { render, screen } from "@testing-library/react"
import { IncomeAssistant } from "../IncomeAssistant"
import { IncomeAssistantProps } from "../IncomeAssistant.types"

describe("IncomeAssistant", () => {
  const defaultProps: IncomeAssistantProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  it("renders without crashing", () => {
    render(<IncomeAssistant {...defaultProps} />)
    expect(screen.getByTestId("income-assistant")).toBeInTheDocument()
  })
})
