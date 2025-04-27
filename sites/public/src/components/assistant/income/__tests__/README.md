# Income Assistant Tests

This document explains the test requirements for the Income Assistant component.

## Test Requirements

### 1. Basic Rendering

- Component must render when `isOpen` is true
- Component must not render when `isOpen` is false
- Component must have proper accessibility attributes:
  - `data-testid="income-assistant"`
  - `aria-label="Income Assistant"`

### 2. String Handling

- Component must accept custom strings via the `strings` prop:
  ```typescript
  strings?: {
    title?: string
    close?: string
    error?: string
  }
  ```
- When custom strings are provided, they should be used
- When no custom strings are provided, fall back to translations:
  - Title: `t("application.income.assistant.title")`
  - Close button: `t("t.close")`

### 3. User Interactions

- Close button must call the `onClose` prop when clicked
- Close button text should be either:
  - Custom string from `strings.close`
  - Or translation `t("t.close")`

### 4. Error Handling

- Use UI Seeds components for error display:
  - `ErrorMessage`
  - `AlertBox`
  - `AlertNotice`
- Display errors with proper styling and accessibility
- Handle errors gracefully

## Implementation Tips

1. Use the UI Seeds components for consistent styling
2. Ensure all text content is either:
   - From custom strings prop
   - Or from translations
3. Include proper accessibility attributes
4. Handle the `isOpen` prop to control visibility
5. Implement the close button with proper click handling
6. Use proper TypeScript types and imports
7. Follow Bloom's component structure patterns

## Example Implementation

```typescript
import React from "react"
import { t, ErrorMessage, AlertBox, AlertNotice } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import { IncomeAssistantProps } from "./IncomeAssistant.types"
import styles from "./IncomeAssistant.module.scss"

const IncomeAssistant = (props: IncomeAssistantProps) => {
  const { isOpen, onClose, strings, testId, ariaLabel, className, children } = props

  if (!isOpen) return null

  return (
    <div className={className} data-testid={testId} aria-label={ariaLabel}>
      <h2 className={styles.title}>{strings?.title ?? t("application.income.assistant.title")}</h2>
      {children}
      <Button variant="primary" onClick={onClose} className={styles.closeButton}>
        {strings?.close ?? t("t.close")}
      </Button>
    </div>
  )
}

export { IncomeAssistant as default, IncomeAssistant }
```

## Key Implementation Notes

1. **UI Seeds Components**: Use components from `@bloom-housing/ui-seeds` for consistent styling
2. **Styling**:
   - Use SCSS modules for component-specific styles
   - Follow UI Seeds design tokens
3. **TypeScript**:
   - Import and use proper types
   - Use proper prop destructuring
4. **Accessibility**:
   - Include all required ARIA attributes
   - Use semantic HTML elements
5. **Children**:
   - Support rendering of children components
   - Use proper TypeScript type for children
6. **Error Handling**:
   - Use UI Seeds error components for displaying errors
   - Handle errors gracefully
