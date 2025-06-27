import { PromptCard } from "../components/refinement/types";
import { ProductIdea, ProblemStatement } from "../types";
import { callChatGPTProxy } from "./api/geminiApi";
import { toast } from "sonner";

export async function generateTailoredPrompts(
  problemStatement: ProblemStatement,
  selectedIdea: ProductIdea,
  deckType: 'scamper' | 'whatif' | 'kaizen'
): Promise<PromptCard[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    let promptTypeDescription = "";
    let numberOfPrompts = 7;
    
    switch(deckType) {
      case 'scamper':
        promptTypeDescription = `
          SCAMPER is an ideation framework that stands for:
          - S: Substitute (What can you replace?)
          - C: Combine (What can you merge?)
          - A: Adapt (How can you adjust to another context?)
          - M: Modify/Magnify/Minimize (What can you change?)
          - P: Put to other use (What else can it be used for?)
          - E: Eliminate (What can you remove?)
          - R: Reverse/Rearrange (What can you reorder?)
          
          Generate 7 questions, one for each letter of SCAMPER.
        `;
        break;
      case 'whatif':
        promptTypeDescription = `
          "What If" questions are hypothetical scenarios that spark creative thinking by exploring possibilities.
          These questions typically start with "What if..." and propose a scenario that challenges assumptions.
          
          Generate 7 "What If" questions that encourage the user to think beyond limitations and explore new possibilities.
        `;
        break;
      case 'kaizen':
        promptTypeDescription = `
          Kaizen is a Japanese concept meaning "continuous improvement." It focuses on making small, incremental changes
          to improve efficiency, quality, and effectiveness.
          
          Generate 7 Kaizen-focused questions that encourage examining the current idea for areas of improvement,
          efficiency gains, or quality enhancements.
        `;
        break;
    }

    const prompt = `
      You are helping a student refine their product idea through targeted prompts.
      
      PROBLEM STATEMENT:
      ${problemStatement.problem}
      
      OPPORTUNITY:
      ${problemStatement.opportunity}
      
      SELECTED IDEA:
      Title: ${selectedIdea.title}
      Description: ${selectedIdea.description}
      Rationale: ${selectedIdea.rationale}
      Features:
      ${selectedIdea.features.map(f => `- ${f.name}: ${f.description}`).join('\n')}
      
      TASK:
      Generate ${numberOfPrompts} thought-provoking questions for the "${deckType.toUpperCase()}" framework that are specifically tailored 
      to this particular idea, problem, and opportunity.
      
      ${promptTypeDescription}
      
      GUIDELINES:
      - Each question must be tailored to the specific idea, not generic
      - Include a concrete example for each question to help the user understand how to approach it, but do NOT provide any suggested answers or lead users in a specific direction
      - Ensure examples are open-ended and don't suggest specific solutions
      - The examples should clarify the question without providing an actual answer
      - Let users come up with their own answers without bias
      
      FORMAT REQUIREMENTS:
      - Return ONLY valid JSON with this exact structure:
      
      [
        {
          "id": 1,
          "question": "Specific, tailored question related to the idea?",
          "example": "E.g., A concrete example that clarifies without suggesting answers",
          "answer": "",
          "deckType": "${deckType}"
        },
        // more questions...
      ]
      
      IMPORTANT:
      - Make questions highly specific to the idea, NOT generic templates
      - Each question should focus on a different aspect of improvement
      - Examples should directly relate to the specific idea, but NOT suggest specific answers
      - Return ONLY the JSON array, no introduction, explanation, or conclusion text
    `;

    const responsePromise =  callChatGPTProxy(prompt);
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('API call timed out')), 30000);
    });

    const responseText = await Promise.race([responsePromise, timeoutPromise]);
    clearTimeout(timeoutId);
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/(\[[\s\S]*\])/);
    if (!jsonMatch) {
      console.error("Could not extract JSON from response:", responseText);
      throw new Error("Failed to generate tailored questions");
    }
    
    const jsonText = jsonMatch[0];
    const parsedData = JSON.parse(jsonText) as PromptCard[];
    
    return parsedData;
  } catch (error) {
    console.error("Error generating tailored prompts:", error);
    clearTimeout(timeoutId);
    controller.abort(); // Ensure we abort any pending requests
    return [];
  }
}

export async function generateAISuggestion(question: string, deckType: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const prompt = `
      You are helping a student refine their product idea. They are working with a prompt question and need a suggestion to help them think about it more deeply.
      
      PROMPT QUESTION: "${question}"
      APPROACH TYPE: ${deckType}
      
      Please provide a short, thoughtful suggestion (max 2 sentences) that could help them think about this question in a new way. 
      
      IMPORTANT GUIDELINES:
      - Do NOT provide a direct answer to the question
      - Instead, offer a lens or perspective they could consider
      - Be concise (no more than 2 sentences)
      - Focus on stimulating their creativity, not directing their answer
      - Your suggestion should open up possibilities, not narrow them
      - Return ONLY the suggestion, with no additional text or formatting
    `;

    const responsePromise = callChatGPTProxy(prompt);
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('API call timed out')), 30000);
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    clearTimeout(timeoutId);
    
    // Clean up the response to get just the suggestion
    const cleanedResponse = response
      .replace(/["']/g, '') // Remove quotes
      .replace(/^(Suggestion:|Here's a suggestion:|I suggest:|Consider:)/i, '') // Remove prefixes
      .trim();
    
    return cleanedResponse;
  } catch (error) {
    console.error("Error generating AI suggestion:", error);
    clearTimeout(timeoutId);
    controller.abort(); // Ensure we abort any pending requests
    throw new Error("Failed to generate AI suggestion");
  }
}
