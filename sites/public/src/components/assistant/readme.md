# Smart-Housing Assistant

Smart-Housing Assistant is Exygy's interactive chatbot component designed to assist users with affordable housing inquiries and application processes. It delivers a guided, conversational interface for enhanced user experience.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**Note:** This project is very much a work in progress (WIP) and may undergo significant changes.

## Overview

The Smart-Housing Assistant module provides a robust chat interface powered by both scripted logic and live LLM responses. It is built with React and TypeScript to deliver dynamic conversation flows, helping users navigate the application process efficiently.

## Features

- **Interactive Chat Interface:** Engage users with a smooth conversational UI.
- **Dynamic Conversation Flow:** Employs scripted questions and supports dynamic query generation.
- **Mode Switching:** Easily toggle between logic-driven and pure LLM modes.
- **State Management:** Utilizes React Context for managing conversation state.

## Folder Structure

- **apppages/**: Domain-specific assistant implementations (e.g., Income Assistant).
- **controller/**: Contains controller logic managing the conversation flow.
- **context/**: Provides React Context and state management for the assistant.
- **shared/**: Shared UI components (e.g., ChatbotPanel, ErrorBoundary).
- **project_tracking/**: Feature documentation and tracking files.
- \***\*tests**/\*\*: Test suites for all assistant components.

## Usage

### Integration Guide

The Smart-Housing Assistant is a modular set of components and services designed to deliver an interactive, conversational experience. Use the following guidelines to integrate and utilize the new files and services:

1. **Component Integration:**

   - Import the desired assistant component (e.g., `IncomeAssistant`) from the `apppages/` directory to add chat capabilities.

   ```tsx
   import IncomeAssistant from "components/assistant/apppages/income/IncomeAssistant"

   function App() {
     return (
       <div>
         <IncomeAssistant isOpen={true} onClose={() => console.log("Assistant closed")} />
       </div>
     )
   }

   export default App
   ```

2. **Controller & State Management:**

   - Conversation logic is managed by `AssistantController` (in `controller/`), which handles message flow and dynamic interactions.
   - Global state is maintained via `AssistantContext` (in `context/`). Wrap your components with `AssistantProvider` if shared state access is needed.

3. **UI & Customization:**
   - Shared UI components like `ChatbotPanel` (in `shared/`) render the chatbot interface. Customize styles and behavior as needed.
   - Modify assistant scripts in `apppages/` to tailor conversation flows. Refer to `IncomeAssistant.types.ts` for interface guidelines.

Follow these steps to effectively integrate and extend the Smart-Housing Assistant in your projects.

## Development

Follow the project's standard development practices:

- Ensure code changes adhere to established coding standards.
- Write tests and run the test suite in the `__tests__` folder to validate functionality.
- Refer to the main repository documentation for additional guidelines.

## License

This project is licensed under the [MIT License](../../LICENSE).
