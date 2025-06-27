
import { callChatGPTProxy } from "../api/geminiApi";
import { 
  ValidationCriteria, 
  ValidationResult, 
  buildValidationPrompt, 
  parseValidationResponse 
} from "./validationService";

interface QuestionValidationResult {
  isValid: boolean;
  message: string;
  explanation?: string;
  feedback?: string;
  suggestedQuestion?: string;
}

export async function validateInterviewQuestion(
  question: string,
  rationale: string,
  opportunity: string
): Promise<QuestionValidationResult> {
  try {
    // Only reject severely inappropriate content
    const severelyInappropriateTerms = [
      "fuck", "shit", "cock", "cunt", "nigger", "faggot", "retard",
      "rape", "suicide", "kill yourself", "terrorist"
    ];
    
    // Only check for clear ethics violations that would be harmful
    const clearEthicsViolationTerms = [
      "deceive without consent", "manipulate", "coerce", "force",
      "spy on", "stalk", "record without consent", "secretly monitor"
    ];
    
    const containsSeverelyInappropriate = severelyInappropriateTerms.some(term => 
      question.toLowerCase().includes(term) || rationale.toLowerCase().includes(term)
    );
    
    const containsClearEthicsViolation = clearEthicsViolationTerms.some(term => 
      question.toLowerCase().includes(term) || rationale.toLowerCase().includes(term)
    );
    
    if (containsSeverelyInappropriate) {
      return {
        isValid: false,
        message: "Question rejected: Contains inappropriate language or content."
      };
    }
    
    if (containsClearEthicsViolation) {
      return {
        isValid: false,
        message: "Question rejected: Appears to violate ethical research guidelines."
      };
    }
    
    // Basic length validation (empty or extremely short questions)
    if (question.trim().length < 3) {
      return {
        isValid: false,
        message: "Question is too short. Please provide a complete question."
      };
    }
    
    // Accept with minimal rationale - for market research, we're more permissive
    if (rationale.trim().length < 5) {
      return {
        isValid: true,
        message: "Question added successfully.",
        feedback: "Consider adding more context to your rationale for better team alignment."
      };
    }
    
    // Create validation criteria
    const criteria: ValidationCriteria = {
      question,
      rationale,
      topic: opportunity
    };
    
    // Build the prompt
    const prompt = buildValidationPrompt(criteria);
    
    // Call the API
    const responseText = await callChatGPTProxy(prompt);
    
    // Parse the response
    const validationResponse = parseValidationResponse(responseText);
    
    if (validationResponse.isValid) {
      return {
        isValid: true,
        message: "Question added successfully.",
        feedback: validationResponse.feedback,
        suggestedQuestion: validationResponse.suggestedQuestion
      };
    } else {
      return {
        isValid: false,
        message: `Invalid question: ${validationResponse.explanation || validationResponse.feedback}`
      };
    }
  } catch (error) {
    console.error("Error validating question:", error);
    // Be more permissive when validation fails - assume it's a valid question
    return {
      isValid: true,
      message: "Question added (validation service unavailable)",
      feedback: "Our validation service is currently unavailable, but we've added your question."
    };
  }
}
