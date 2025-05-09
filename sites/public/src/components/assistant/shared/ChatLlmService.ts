/* ChatLlmService.ts
   Provides API logic for sending chat messages to the backend LLM.
*/

import axios from "axios"

interface ChatResponse {
  response: string
}

export const sendLLMMessage = async (message: string, history: string[] = []): Promise<string> => {
  try {
    const response = await axios.post<ChatResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_API_BASE || "http://localhost:3100"}/llm/chat`,
      { message, history },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    return response.data.response
  } catch (error) {
    console.error("Error sending chat message:", error)
    return "Sorry, I encountered an issue processing your request."
  }
}
