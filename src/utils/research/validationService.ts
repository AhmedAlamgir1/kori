
export interface ValidationCriteria {
  question: string;
  rationale: string;
  topic: string;
}

export interface ValidationResult {
  isValid: boolean;
  feedback?: string;
  explanation?: string;
  suggestedQuestion?: string;
}

export function buildValidationPrompt(criteria: ValidationCriteria): string {
  return `
    I need to verify if the following interview question and its rationale are valid for a market research interview on this opportunity/topic:
    
    TOPIC: "${criteria.topic}"
    QUESTION: "${criteria.question}"
    USER RATIONALE: "${criteria.rationale}"
    
    Please analyze this interview question with a PERMISSIVE approach, appropriate for informal market research (not academic research):
    
    1. The question should be accepted as long as it's not completely nonsensical
    2. Remember that seemingly off-topic questions can help build rapport and trust
    3. The question should be appropriate and ethical (not severely offensive or harmful)
    
    ETHICAL GUIDELINES (MARKET RESEARCH CONTEXT):
    - The question should be rejected ONLY if it contains severe profanity, explicit sexual content, or hate speech
    - The question should be rejected ONLY if it could cause serious psychological distress
    - The question should be rejected ONLY if it promotes severely unethical practices
    - Questions that are somewhat off-topic but could build rapport should be ACCEPTED
    - Questions that are somewhat personal but not harmful should be ACCEPTED
    - Light humor, ice-breakers, and casual conversational questions should be ACCEPTED
    
    For questions that might be somewhat intrusive but otherwise valid, please suggest a less intrusive rephrased version.
    
    Respond ONLY with a JSON object in this exact format:
    {
      "isValid": true/false,
      "feedback": "brief constructive feedback on the question - keep to 1-2 short sentences maximum.",
      "explanation": "If not valid, explain why briefly. If valid, leave this empty.",
      "suggestedQuestion": "A less intrusive version of the question if needed (only if the original is somewhat intrusive but otherwise valid)."
    }
    
    Be extremely concise with your feedback - no more than 1-2 short sentences.
  `;
}

export function parseValidationResponse(responseText: string): ValidationResult {
  // Extract JSON from response
  const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    return {
      isValid: false,
      explanation: "Unable to validate question. Please try again."
    };
  }
  
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing validation response:", error);
    return {
      isValid: false,
      explanation: "Error processing validation response."
    };
  }
}
