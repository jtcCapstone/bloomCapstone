import axios from 'axios';

interface ChatResponse {
  response: string;
}

// Function to send chat message to the backend API
export const sendChatMessage = async (message: string, history: string[] = []): Promise<string> => {
    try {
      // Make direct request to your backend API instead of going through adapter
    const response = await axios.post<ChatResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_BASE || 'http://localhost:3100'}/llm/chat`,
        { message, history },
        {
        headers: {
            'Content-Type': 'application/json'
        }
        }
    );
    
    return response.data.response;
    } catch (error) {
    console.error('Error sending chat message:', error);
    return 'Sorry, I encountered an issue processing your request.';
    }
};