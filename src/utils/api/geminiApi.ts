import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
      // Construct a more informative error message
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
    throw error; // Re-throw the error for upstream handling
  } finally {
    clearTimeout(timeoutId);
  }
}

// --- Specific AI-driven functions ---

export async function analyzeChatConversation(messages: { content: string; sender: string }[]): Promise<any> {
  try {
    const conversationHistory = messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n');

    const prompt = `
    Analyze this research conversation and extract the TOP 3 most significant insights for each category. Only include insights that were explicitly discussed - do not make assumptions.
    
    Provide:
    1. Key Quotes: Top 3 most impactful direct quotes from the conversation
    2. Key Insights: Top 3 most important findings derived from the quotes
    3. Value Hierarchy Mapping: Top 3 most prominent values across these categories:
        - Psychological values (e.g., memory making, confidence, self-expression, motivation, legacy, social affirmation, mental wellness)
        - Emotional values (e.g., curiosity, nostalgia, emotional attachment, fun/entertainment, spontaneity)
        - Functional values (e.g., saves time, simplifies, reduces risk, accessibility, authenticity, sensory appeal)
    4. Pain Points: If any challenges, frustrations, or problems were mentioned, include the top 3 most significant ones with supporting quotes

    IMPORTANT:
    - Use exact quotes when available
    - Format as a valid JSON object with ONLY these fields: "quotes", "insights", "valueHierarchy", and optionally "painPoints"
    - For pain points, only include if explicitly mentioned in conversation
    - Limit each array to exactly 3 items maximum. If fewer than 3 are found, provide only the ones found.
    - If no pain points are found, the "painPoints" key should be omitted entirely or set to null.
    
    Example format:
    {
      "quotes": ["most impactful quote 1", "most impactful quote 2", "most impactful quote 3"],
      "insights": ["key finding 1", "key finding 2", "key finding 3"],
      "valueHierarchy": ["most prominent value 1", "most prominent value 2", "most prominent value 3"],
      "painPoints": {
        "quotes": ["most significant pain point quote 1", "most significant pain point quote 2", "most significant pain point quote 3"],
        "insights": ["most significant pain point finding 1", "most significant pain point finding 2", "most significant pain point finding 3"]
      }
    }

    CONVERSATION:
    ${conversationHistory}
    
    RESPONSE (ensure valid JSON format):`;

    // Use the new helper function for the API call
    const responseText = await callChatGPTProxy(prompt, { model: "gpt-4o-mini", temperature: 0.2 });

    try {
      // Attempt to parse the response directly as JSON
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing JSON response from analyzeChatConversation:", parseError);
      console.log("Raw response that failed to parse:", responseText);

      // Robust fallback: try to extract JSON from the response text using regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          toast.info("Successfully extracted and parsed JSON from partial AI response.");
          return extractedJson;
        } catch (extractError) {
          console.error("Error parsing extracted JSON from regex match:", extractError);
          toast.error("AI analysis format was invalid and could not be repaired. Please try again.");
          throw new Error("Invalid analysis format received");
        }
      }

      // If no valid JSON found even after extraction attempt
      toast.error("AI analysis did not return valid JSON. Please try again.");
      throw new Error("AI analysis did not return valid JSON."); // Throw an error instead of returning partial object
    }
  } catch (error) {
    console.error("Error analyzing chat:", error);
    throw new Error(`Failed to analyze chat conversation: ${error.message || 'Unknown error'}`);
  }
}

export const generateContent = async (prompt: string): Promise<string> => {
  try {
    // Use the new helper function for the API call
    const response = await callChatGPTProxy(prompt, { model: "gpt-4o-mini" }); // You can specify model/temperature here
    return response;
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error(`Failed to generate content: ${error.message || 'Unknown error'}`);
    throw error;
  }
};

export const generateRespondentProfiles = async (prompt: string): Promise<string> => {
  try {
    console.log("Starting ChatGPT API call through proxy for profiles...");
    // Use the new helper function for the API call
    const response = await callChatGPTProxy(prompt, { model: "gpt-4o-mini", temperature: 0.7 }); // Example temperature
    
    // IMPORTANT: If this function expects JSON for profiles, you MUST parse it here.
    // The prompt for this call (passed in `prompt` argument) must instruct the AI to return JSON.
    // Example for parsing if JSON is expected:
    // try {
    //   return JSON.parse(response);
    // } catch (e) {
    //   console.error("Error parsing profile JSON:", e);
    //   toast.error("Failed to parse respondent profiles. Invalid AI response format.");
    //   throw new Error("Invalid format for respondent profiles.");
    // }
    return response; // If it just returns plain text, this is fine
  } catch (error) {
    console.error('Error generating profiles:', error);
    toast.error(`Failed to generate profiles: ${error.message || 'Unknown error'}`);
    throw error;
  }
};