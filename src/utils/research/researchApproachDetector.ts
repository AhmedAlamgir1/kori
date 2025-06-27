// Assuming this file is something like: src/utils/research/researchApproachDeterminer.ts
// Or wherever determineResearchApproach is located.

// Adjust this import path based on where you placed the callChatGPTProxy function.
// For example, if it's in src/api/apiCalls.ts
import { callChatGPTProxy } from "../api/geminiApi"; // <--- ADJUSTED IMPORT PATH

export interface ResearchApproachResult {
  approach: "explorative" | "evaluative";
  explanation: string;
  researchGoals?: string[]; // Add researchGoals to interface, as it's in the AI's expected output
}

// Note: This function is now kept for potential future use or other functionality
// but is no longer the primary way to determine research approach (user selection is used instead)
export async function determineResearchApproach(topic: string): Promise<ResearchApproachResult> {
  try {
    const prompt = `
      As a research methodology expert, analyze this topic and determine if it's better suited for EXPLORATIVE or EVALUATIVE research.
      
      TOPIC: "${topic}"
      
      EXPLORATIVE RESEARCH is appropriate when:
      - The problem/opportunity is not well understood yet
      - We need to discover unknown variables or perspectives
      - We're in early stages of understanding user needs or behaviors
      - We're trying to identify patterns, motivations, or pain points
      - The research is about gathering insights for new ideas
      
      EVALUATIVE RESEARCH is appropriate when:
      - We have existing solutions, prototypes, or concepts to test
      - We need feedback on specific ideas or implementations
      - We're validating assumptions or hypotheses
      - We're comparing alternatives or measuring success
      - The research focuses on refining or improving something specific
      
      Based on this topic, determine which approach is more suitable.
      
      Return ONLY a JSON object in this format:
      {
        "approach": "explorative" or "evaluative",
        "explanation": "2-3 sentence explanation of why this approach is more suitable",
        "researchGoals": ["goal 1", "goal 2", "goal 3"]
      }
      
      Ensure your analysis considers the specific wording and context of the topic. If the topic is ambiguous, lean toward explorative research.
    `;

    // Use the callChatGPTProxy function with specific model and temperature for this task
    const responseText = await callChatGPTProxy(prompt, { model: "gpt-4o-mini", temperature: 0.1 }); // Lower temperature for more deterministic output

    // Extract JSON from response
    const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response for research approach determination:", responseText);
      throw new Error("AI response format error. Unable to parse research approach determination.");
    }

    const result = JSON.parse(jsonMatch[0]);

    // --- Added validation for the parsed JSON structure ---
    const validApproaches = ["explorative", "evaluative"];
    if (
      !result ||
      !result.approach ||
      !validApproaches.includes(result.approach.toLowerCase()) ||
      typeof result.explanation !== 'string' ||
      (result.researchGoals !== undefined && !Array.isArray(result.researchGoals))
    ) {
      console.error("Parsed AI response has unexpected structure for research approach:", result);
      throw new Error("AI provided an unexpected research approach format.");
    }

    return {
      approach: result.approach.toLowerCase() as "explorative" | "evaluative",
      explanation: result.explanation,
      researchGoals: Array.isArray(result.researchGoals) ? result.researchGoals : [] // Ensure it's an array or default to empty
    };
  } catch (error) {
    console.error("Error determining research approach:", error);
    // Default to explorative research if there's an error and provide a clear explanation
    return {
      approach: "explorative",
      explanation: `Defaulting to explorative research due to an error: ${error instanceof Error ? error.message : 'Unknown error'}.`
    };
  }
}