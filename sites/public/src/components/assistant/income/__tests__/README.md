# Income Assistant Tests

This document outlines the current test coverage for the Income Assistant component.

## Current Test Coverage

### 1. Basic UI Tests

- ✅ Component renders when `isOpen` is true
- ✅ Component does not render when `isOpen` is false
- ✅ Component displays correct title
- ✅ Component minimizes when close button is clicked

### 2. Component Props

```typescript
interface IncomeAssistantProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  strings?: {
    title?: string
    close?: string
    error?: string
  }
}
```

### 3. Test Implementation

```typescript
import { render, screen, fireEvent } from "@testing-library/react"
import IncomeAssistant from "../IncomeAssistant"

describe("<IncomeAssistant />", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  it("renders when open", () => {
    render(<IncomeAssistant {...defaultProps} />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("shows correct title", () => {
    render(<IncomeAssistant {...defaultProps} />)
    expect(screen.getByText("Income Assistant")).toBeInTheDocument()
  })

  it("doesn't render when closed", () => {
    render(<IncomeAssistant {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("calls onClose when minimized", () => {
    render(<IncomeAssistant {...defaultProps} />)
    fireEvent.click(screen.getByRole("button", { name: /close/i }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
```

## Future Test Expansion

As the component evolves to include chat functionality, additional tests will be added for:

1. Chat Interaction

   - Message sending/receiving
   - Chat history management
   - Error handling

2. Income Calculation

   - Input validation
   - Calculation accuracy
   - Error states

3. State Management
   - Context integration
   - Step progression
   - Data persistence

## Test Guidelines

1. Use React Testing Library
2. Focus on user interactions
3. Test accessibility features
4. Mock external dependencies
5. Follow AAA pattern (Arrange, Act, Assert)
