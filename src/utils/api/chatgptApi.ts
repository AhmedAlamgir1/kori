// src/api/apiCalls.ts (or wherever you put your callChatGPTProxy function)

import { toast } from "sonner"; // Assuming you have 'sonner' for toasts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

/**
 * Helper function for making POST requests to the ChatGPT proxy backend.
 * This centralizes the logic for making AI calls.
 * @param prompt The main text prompt for the AI.
 * @param options Optional configuration for the AI call (e.g., model, temperature).
 * @returns A promise that resolves to the AI's text response.
 */
export async function callChatGPTProxy(
  prompt: string,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    console.log("Starting AI proxy call...");

    const requestBody = {
      prompt,
      model: options?.model,        // Pass model if provided
      temperature: options?.temperature // Pass temperature if provided
    };

    const response = await fetch(`${API_BASE_URL}/api/chatgpt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown server error', details: 'No JSON response' }));
      console.error('API call failed with status:', response.status, 'Error data:', errorData);
      const errorMessage = errorData.details || errorData.error || `Failed to generate content (HTTP ${response.status})`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (typeof data.response !== 'string') {
        throw new Error('AI response did not contain expected text content.');
    }
    return data.response;
  } catch (error) {
    console.error('Error in AI proxy call:', error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      toast.error('AI response timed out. Please try again.');
    } else if (error instanceof Error) {
      toast.error(`Failed to get AI response: ${error.message}`);
    } else {
      toast.error('An unexpected error occurred during AI call. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}