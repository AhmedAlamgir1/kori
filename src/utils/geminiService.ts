import { ProblemStatement, GeminiResponse } from "../types";
import { toast } from "sonner";
import { callChatGPTProxy } from "./api/geminiApi";

// Separate validation function that can be called before showing loading state
export function validateInput(problemStatement: ProblemStatement): { isValid: boolean; error?: string } {
  try {
    // First check if inputs are empty or just whitespace
    if (!problemStatement.opportunity?.trim()) {
      return { isValid: false, error: "Opportunity area cannot be empty" };
    }
    
    if (!problemStatement.problem?.trim()) {
      return { isValid: false, error: "Problem statement cannot be empty" };
    }

    // Check for offensive content first - before any other validation
    const offensivePatterns = [
      // Severe profanity and slurs
      /\b(fuck|cunt|nigger|faggot)\b/i,
      
      // Sexual content
      /\b(porn|nude|horny)\b/i,
      
      // Hate speech
      /\b(hate|hating|hateful)\b.*?\b(race|gender|religion|orientation)\b/i,
      
      // Test inputs
      /^test\d*$/i,
      /^asdf+$/i,
      /^qwerty$/i,
      
      // Random characters
      /^[asdfghjkl;']{5,}$/i,

      // Additional offensive patterns
      /\b(rape|molest)\b/i,
      /\b(nazi|hitler|kkk|terrorist)\b/i
    ];

    // Check both inputs for inappropriate content
    const combinedText = `${problemStatement.opportunity} ${problemStatement.problem}`.toLowerCase();
    
    for (const pattern of offensivePatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        return { isValid: false, error: "Please ensure your content is professional and appropriate. Offensive or inappropriate content is not allowed." };
      }
    }

    // Word count validation with improved counting
    const countWords = (text: string) => {
      return text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .length;
    };

    const problemWords = countWords(problemStatement.problem);
    const opportunityWords = countWords(problemStatement.opportunity);
    
    // Word count requirements
    if (opportunityWords < 3) {
      return { isValid: false, error: `Opportunity area should be at least 3 words to be meaningful (currently: ${opportunityWords} words)` };
    }
    
    if (problemWords < 20) {
      return { isValid: false, error: `Problem statement should be at least 20 words to provide sufficient context (currently: ${problemWords} words)` };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "An error occurred while validating your input." };
  }
}

async function generateIdeaBatch(problemStatement: ProblemStatement, startId: number, isSecondBatch: boolean): Promise<any> {
  const prompt = `
    Act as an innovation consultant for students. 
    
    CONTEXT:
    - Students are working on innovation projects.
    - They need digital product ideas to solve a specific opportunity/problem.
    
    OPPORTUNITY: ${problemStatement.opportunity}
    PROBLEM STATEMENT: ${problemStatement.problem}
    
    TASK:
    Generate 4 innovative digital product ideas that address this opportunity and problem.
    
    For ALL IDEAS, provide original concepts following this format:
    1. A clear, concise title
    2. A brief description (1-2 sentences)
    3. A rationale explaining why this idea is appropriate for the problem (2-3 sentences)
    4. Exactly 3 key features with short descriptions
    
    ${isSecondBatch ? 
      'NOTE: For these ideas (IDs 5-8), research existing digital solutions to this problem, then create innovative improvements to these existing solutions. However, present these ideas in the same format - do not explicitly mention they are improvements to existing solutions. IMPORTANT: Use completely different naming patterns and concepts from the first batch (IDs 1-4). For example, if the first batch used names like "EcoTrack" or "GreenHub", use different naming patterns like "RecycleAI" or "WasteWise".' 
      : 
      'NOTE: These ideas (IDs 1-4) should be completely original concepts, not improvements to existing solutions. Use creative, unique names that reflect the innovative nature of the solution. Focus on novel approaches and fresh perspectives.'}
    
    FORMAT YOUR RESPONSE AS VALID JSON matching this structure:
    {
      "ideas": [
        {
          "id": ${startId},
          "title": "Product Name",
          "description": "Brief product description",
          "rationale": "Why this idea makes sense for the problem",
          "features": [
            {
              "name": "Feature 1 Name",
              "description": "Feature 1 description"
            },
            {
              "name": "Feature 2 Name",
              "description": "Feature 2 description"
            },
            {
              "name": "Feature 3 Name",
              "description": "Feature 3 description"
            }
          ]
        },
        {
          "id": ${startId + 1},
          "title": "Product Name",
          "description": "Brief product description",
          "rationale": "Why this idea makes sense for the problem",
          "features": [
            {
              "name": "Feature 1 Name",
              "description": "Feature 1 description"
            },
            {
              "name": "Feature 2 Name",
              "description": "Feature 2 description"
            },
            {
              "name": "Feature 3 Name",
              "description": "Feature 3 description"
            }
          ]
        },
        {
          "id": ${startId + 2},
          "title": "Product Name",
          "description": "Brief product description",
          "rationale": "Why this idea makes sense for the problem",
          "features": [
            {
              "name": "Feature 1 Name",
              "description": "Feature 1 description"
            },
            {
              "name": "Feature 2 Name",
              "description": "Feature 2 description"
            },
            {
              "name": "Feature 3 Name",
              "description": "Feature 3 description"
            }
          ]
        },
        {
          "id": ${startId + 3},
          "title": "Product Name",
          "description": "Brief product description",
          "rationale": "Why this idea makes sense for the problem",
          "features": [
            {
              "name": "Feature 1 Name",
              "description": "Feature 1 description"
            },
            {
              "name": "Feature 2 Name",
              "description": "Feature 2 description"
            },
            {
              "name": "Feature 3 Name",
              "description": "Feature 3 description"
            }
          ]
        }
      ]
    }
    
    IMPORTANT: 
    - Ensure you generate exactly 4 ideas
    - Each idea must have exactly 3 features
    - Each idea must include a rationale explaining why it was suggested
    - Response must be valid JSON (no markdown, no explanations)
    - Be creative and diverse in your ideas
    - Make ideas specific to the opportunity/problem
    - Even if the problem statement seems vague or simple, do your best to generate relevant ideas
    - Only respond with an error if the input is complete gibberish or nonsense
    - IMPORTANT: Use the exact IDs provided in the template (${startId}, ${startId + 1}, ${startId + 2}, ${startId + 3})
    ${isSecondBatch ? 
      '- CRITICAL: Use completely different naming patterns and concepts from the first batch. If the first batch used names like "EcoTrack" or "GreenHub", use different patterns like "RecycleAI" or "WasteWise". Avoid any similar naming conventions or concepts.' 
      : 
      '- CRITICAL: These should be completely original concepts with unique naming patterns. Focus on novel approaches and fresh perspectives.'}
  `;

  const textResponse = await callChatGPTProxy(prompt);
  
  const jsonMatch = textResponse.match(/({[\s\S]*})/);
  if (!jsonMatch) {
    throw new Error("Could not extract JSON from response");
  }
  
  const jsonText = jsonMatch[0];
  const parsedData = JSON.parse(jsonText);
  
  if (parsedData.error) {
    throw new Error(parsedData.error);
  }
  
  if (!parsedData.ideas || !Array.isArray(parsedData.ideas) || parsedData.ideas.length === 0) {
    throw new Error("Invalid response format: missing ideas array");
  }

  // Ensure IDs are set correctly
  parsedData.ideas = parsedData.ideas.map((idea: any, index: number) => ({
    ...idea,
    id: startId + index
  }));

  return parsedData;
}

export async function generateIdeas(problemStatement: ProblemStatement): Promise<GeminiResponse> {
  validateInput(problemStatement);

  try {
    // Generate first batch of 4 ideas (IDs 1-4)
    const firstBatch = await generateIdeaBatch(problemStatement, 1, false);
    
    // Generate second batch of 4 ideas (IDs 5-8)
    const secondBatch = await generateIdeaBatch(problemStatement, 5, true);
    
    // Combine both batches
    const combinedIdeas = {
      ideas: [...firstBatch.ideas, ...secondBatch.ideas]
    };

    return combinedIdeas;
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw error;
  }
}
