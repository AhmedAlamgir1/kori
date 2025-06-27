import { toast } from "sonner";
import { ValidationResult } from "./types";

// Core offensive or inappropriate words
const offensiveWords = [
  // Profanity and explicit content
  "fuck", "shit", "ass", "bitch", "cunt", "pussy", "cock", "whore",
  "slut", "dick", "porn", "nsfw", "xxx",
  // Hate speech
  "nigger", "faggot", "nazi", "kkk",
  // Violence
  "kill", "murder", "rape"
];

export async function validateProblemStatement(opportunity: string, problem: string): Promise<ValidationResult> {
  try {
    // Basic validation
    if (!opportunity.trim() || !problem.trim()) {
      return {
        isValid: false,
        message: "Both opportunity area and problem statement are required."
      };
    }

    // Word count validation
    const opportunityWords = opportunity.trim().split(/\s+/).filter(Boolean);
    if (opportunityWords.length < 3) {
      return {
        isValid: false,
        message: `Opportunity area must contain at least 3 words (currently: ${opportunityWords.length} words)`
      };
    }

    // Problem statement validation
    const problemWords = problem.trim().split(/\s+/).filter(Boolean).length;
    if (problemWords < 20) {
      return {
        isValid: false,
        message: `Problem statement should be at least 20 words to provide sufficient context (currently: ${problemWords} words)`
      };
    }

    // Check for offensive language
    const hasOffensiveContent = opportunityWords.some(word => {
      const wordLower = word.toLowerCase();
      return offensiveWords.includes(wordLower) || 
             offensiveWords.some(offensive => wordLower.includes(offensive));
    });
    
    if (hasOffensiveContent) {
      return {
        isValid: false,
        message: "Please maintain professional language. Offensive or explicit content is not allowed."
      };
    }

    // Success case
    return {
      isValid: true,
      message: "Input validated successfully."
    };

  } catch (error) {
    console.error("Error validating input:", error);
    return {
      isValid: false,
      message: "An error occurred while validating your input. Please try again."
    };
  }
}
