# LLM Integration: Endpoint and Payload Alignment

## Current State

- **Frontend Assistant** (`ChatbotPanel.tsx`):

  - Sends user data to a placeholder endpoint: `/api/your-endpoint`
  - Payload is an array of `{ question, answer }` objects:
    ```json
    [
      { "question": "How many people in your house earn an income?", "answer": "2" },
      { "question": "How much do you make per hour?", "answer": "15" }
    ]
    ```

- **Backend LLM API** (`llm.controller.ts`):
  - Listens at endpoint: `/llm/chat`
  - Expects a payload with a single `message` and optional `history`:
    ```json
    {
      "message": "How do I report my income?",
      "history": ["Hi!", "Hello, how can I help you?"]
    }
    ```

## Problem

- **Endpoints do not match:**  
  The frontend is not sending requests to the backend LLM endpoint.
- **Payloads do not match:**  
  The backend expects a different structure than what the frontend sends.

## Future Solution

- **Align the endpoint:**  
  Update the frontend to send requests to `/llm/chat` (or the correct backend route).
- **Align the payload:**  
  Update the frontend to send a payload like:
  ```json
  {
    "message": "user's latest message",
    "history": ["previous message 1", "previous message 2"]
  }
  ```
- **Result:**  
  This will enable seamless communication between the assistant UI and the LLM backend, allowing for real-time, AI-powered responses.

---

_This document tracks the integration status and outlines the steps needed for full LLM assistant functionality._
