# Income Assistant Tests

This document outlines the test coverage for the Income Assistant component based on the current implementation in IncomeAssistant.test.tsx.

## Test Coverage

1. **Component Rendering When Open**:

   - The IncomeAssistant component should render when the `isOpen` prop is set to true.
   - This is verified by checking for an element with `data-testid="chatbot-panel"`.

2. **Component Non-Rendering When Closed**:

   - The component should not render when the `isOpen` prop is false.
   - Verified by confirming that the element with `data-testid="chatbot-panel"` does not exist.

3. **Minimization Functionality**:
   - When the "Minimize" button (rendered within the ChatbotPanel mock) is clicked, the `onClose` callback should be triggered exactly once.

## Implementation Details

- The tests are implemented using React Testing Library and Jest.
- A custom Jest mock for the `ChatbotPanel` is used to simulate a basic UI, rendering a div with a "Minimize" button.
- Each test wraps the `IncomeAssistant` component inside an `AssistantProvider` to provide the necessary context.
- Mocks are cleared before each test using `jest.clearAllMocks()`.

## How to Run These Tests

You can run these tests in two ways:

- **From the project root:**

  yarn jest sites/public/src/components/assistant/income/tests

- **Using the unit test script from sites/public:**

  1. Navigate to the sites/public directory:
     cd sites/public
  2. Run the unit tests for IncomeAssistant:

  yarn test:unit src/components/assistant/income/tests

Make sure to use the correct folder path ("tests" directory) that reflects your current directory structure.
