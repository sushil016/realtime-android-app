import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXPO_PUBLIC_GEMINI_API_KEY } from '@env';

export const verifyApiKey = async () => {
  try {
    console.log('API Key:', EXPO_PUBLIC_GEMINI_API_KEY); // Remove this in production
    const genAI = new GoogleGenerativeAI(EXPO_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Test the API key with a simple prompt
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log('API Test Response:', response.text());
    return true;
  } catch (error) {
    console.error('API Key Verification Error:', error);
    return false;
  }
}; 