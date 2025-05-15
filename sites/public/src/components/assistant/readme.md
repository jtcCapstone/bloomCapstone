# Smart-Housing Assistant

Smart-Housing Assistant is Exygy's interactive chatbot component designed to assist users with affordable housing inquiries and application processes. It delivers a guided, conversational interface for enhanced user experience.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**Note:** This project is very much a work in progress (WIP) and may undergo significant changes.

## Overview

The Smart-Housing Assistant module provides a robust chat interface powered by both scripted logic and live LLM responses. It is built with React and TypeScript to deliver dynamic conversation flows, helping users navigate the application process efficiently.

## Features

- **Smart-Housing Assistant**: An interactive chatbot that assists users with affordable housing inquiries and application processes.
- **Dynamic Conversation Flow**: Supports scripted questions and live LLM responses, allowing users to navigate the application process efficiently.
- **Current Working Application Page(income.tsx**: Integration with income validation system
- **LLM Service**: Processes chat requests and generates responses using a language model, with input sanitization to protect user data.

## Folder Structure

- **Income/**: Contains the implementation specific to the Income Assistant, including scripts and components related to income reporting.
  - **IncomeAssistant.tsx**: The main component for the Income Assistant.
- **shared/**: Contains shared UI components used across different assistants.

  - **ChatbotPanel.tsx**: The panel that displays the chatbot interface.
  - **ErrorBoundary.tsx**: Component for error handling in the assistant.
  - **AssistantOpenButton.tsx**: Button component to open the assistant.

- **controller/**: Contains logic for managing the conversation flow and interactions within the assistant.

- **context/**: Provides React Context for managing the state of the assistant across different components.

- **scripts/**: Contains various scripts used by the assistants for conversation management and logic.

  - **incomeScript.ts**: Script used for guiding the conversation in the Income Assistant.

- **types.ts**: Type definitions used throughout the assistant components.

- ****tests**/**: Test suites for all assistant components, ensuring functionality and reliability.

- **project_tracking/**: Documentation and tracking files related to the development and features of the assistant.

## Usage Guide

### Running the Application

To run the public application, use the following command:

```bash
yarn dev:public
```

This command starts the public-facing application on [http://localhost:3000](http://localhost:3000). Ensure that the backend API is also running, as the frontend relies on it for data.

### Integrating the Smart-Housing Assistant

To integrate the Smart-Housing Assistant into your application pages, follow these steps:

1. **Import the Required Components**:
   In your application page file (e.g., `@income.tsx`), import the `IncomeAssistant` and `AssistantOpenButton` components from the appropriate paths. Here’s an example:

   ```tsx
   import React, { useState } from "react"
   import IncomeAssistant from "components/assistant/Income/IncomeAssistant"
   import AssistantOpenButton from "components/assistant/AssistantOpenButton"
   ```

### Adding the Assistant to Other Application Pages

The Smart-Housing Assistant has been designed with modularity and scalability in mind, allowing for easy integration into various application pages. This system architecture enables developers to quickly add the assistant to new pages without significant overhead.

#### Design Considerations:

- **Component-Based Architecture**: The assistant is built as a set of reusable React components (`IncomeAssistant` and `AssistantOpenButton`). This allows developers to import and use these components in any page of the application seamlessly.
- **State Management**: By utilizing React's `useState` hook, the assistant's visibility can be easily controlled within any component. This design pattern promotes consistency across different pages while maintaining flexibility.

- **Customizable Props**: The components accept props that allow for customization, such as the button title and confirmation handling. This makes it easy to tailor the assistant's behavior to fit the specific needs of each page.

- **Scalable Integration**: New pages can be integrated with the assistant by simply repeating the import and component integration steps. This approach minimizes the need for redundant code and promotes a clean, maintainable codebase.

By following these design principles, the Smart-Housing Assistant can be efficiently expanded to other application pages, enhancing the overall user experience and providing consistent support throughout the application process.

Follow the project's standard development practices:

- Ensure code changes adhere to established coding standards.
- Refer to the main repository documentation for additional guidelines.

## License

This project is licensed under the [MIT License](../../LICENSE).
