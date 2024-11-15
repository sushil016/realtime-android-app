import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_URL } from '@env';

// Initialize the model with the API key from .env
const genAI = new GoogleGenerativeAI(API_URL);

// Create a more robust chat model
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  },
});

// Create a chat session
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: "You are a helpful AI assistant. Be concise but friendly in your responses.",
    },
    {
      role: "model",
      parts: "I understand. I'll be helpful, friendly, and concise in my responses.",
    },
  ],
});

export const generateResponse = async (prompt: string) => {
  try {
    if (!API_URL) {
      throw new Error('Gemini API key is not configured');
    }

    // Use the chat session for better context
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini AI Error:', error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      return 'Error: Invalid API key. Please check your configuration.';
    }
    
    if (error.message?.includes('not configured')) {
      return 'Error: API key is not configured. Please check your environment setup.';
    }

    return 'I apologize, but I am having trouble processing your request right now. Please try again later.';
  }
}; 