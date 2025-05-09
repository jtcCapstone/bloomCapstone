/*
  AssistantController.types.ts
  =============================
  Type definitions for the assistant controller and related data structures.
*/

// Represents a single chat message.
export interface ChatMessage {
  id: string
  content: string
  sender: "assistant" | "user"
  timestamp: Date
}

// Defines the structure for a single question in the assistant script.
export interface AssistantQuestion {
  id: string
  question: string
  type: string
  validation?: (value: string) => boolean
  dynamicQuestionHandler?: (input: string, responses: string[]) => AssistantQuestion[]
}

// Defines the public interface for the AssistantController.
export interface AssistantController {
  /** Initializes the conversation state. */
  initialize(): Promise<void>
  /** Returns the current step index in the conversation flow. */
  getCurrentStep(): number
  /** Processes user input, updates state, and adds messages. */
  sendMessage(input: string): Promise<void>
  /** Returns the current array of conversation messages. */
  getMessages(): ChatMessage[]
  /** Resets the conversation to its initial state. */
  startOver(): Promise<void>
  /** Toggles between script logic mode and pure LLM mode. */
  switchLLMMode(): void
  /** Returns the raw final estimate value from the script's getFinalResult. */
  getFinalEstimate(): string
  /** Indicates if the conversation is ready for confirmation (based on script result). */
  isConfirmReady(): boolean
  /** Returns the current LLM mode (true for pure LLM mode). */
  isPureLlmMode(): boolean
  /** Returns the total count of questions in the current flow, including dynamic ones. */
  getCurrentQuestionsCount(): number
}
