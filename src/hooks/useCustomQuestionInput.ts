import { useState, useEffect } from "react";
import { toast } from "sonner";
import { validateInterviewQuestion } from "@/utils/research/questionValidator";
import type { QuestionWithExplanation } from "@/utils/research/interviewQuestionTypes";

interface UseCustomQuestionInputProps {
  opportunity: string;
  onQuestionAdd: (question: QuestionWithExplanation) => void;
}

export function useCustomQuestionInput({ opportunity, onQuestionAdd }: UseCustomQuestionInputProps) {
  const [customQuestion, setCustomQuestion] = useState("");
  const [customExplanation, setCustomExplanation] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);
  const [showExplanationInput, setShowExplanationInput] = useState(false);
  const [suggestedQuestion, setSuggestedQuestion] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Add effect to auto-dismiss validation feedback
  useEffect(() => {
    if (validationFeedback) {
      const timer = setTimeout(() => {
        setValidationFeedback(null);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [validationFeedback]);

  const validateAndAddCustomQuestion = async () => {
    if (customQuestion.trim()) {
      if (!showExplanationInput) {
        setShowExplanationInput(true);
        return;
      }
      
      setValidating(true);
      setValidationFeedback(null);
      setSuggestedQuestion(null);
      setShowSuggestion(false);
      
      try {
        const validationResult = await validateInterviewQuestion(
          customQuestion.trim(), 
          customExplanation.trim(), 
          opportunity
        );
        
        if (validationResult.isValid) {
          // Store feedback from validation immediately
          setValidationFeedback(validationResult.feedback || null);
          
          // If there's a suggested question, show it to the user
          if (validationResult.suggestedQuestion) {
            setSuggestedQuestion(validationResult.suggestedQuestion);
            setShowSuggestion(true);
          } else {
            // No suggestion, add the original question directly
            addQuestionToList(customQuestion.trim(), validationResult.feedback);
          }
        } else {
          // Show error message and don't proceed with adding the question
          toast.error(validationResult.message || "Invalid question");
          // Reset form for inappropriate content
          if (validationResult.message && (
            validationResult.message.toLowerCase().includes("inappropriate") || 
            validationResult.message.toLowerCase().includes("offensive") ||
            validationResult.message.toLowerCase().includes("profanity")
          )) {
            setCustomQuestion("");
            setCustomExplanation("");
            setShowExplanationInput(false);
          }
        }
      } catch (error) {
        console.error("Error validating question:", error);
        toast.error("Failed to validate question. Please try again.");
      } finally {
        setValidating(false);
      }
    }
  };

  const addQuestionToList = (questionText: string, feedback?: string) => {
    const newQuestion: QuestionWithExplanation = {
      question: questionText.trim(), 
      explanation: customExplanation.trim() || "Custom question added by user",
      feedback: feedback
    };
    
    onQuestionAdd(newQuestion);
    
    // Reset form
    setCustomQuestion("");
    setCustomExplanation("");
    setShowExplanationInput(false);
    setSuggestedQuestion(null);
    setShowSuggestion(false);
    setValidationFeedback(null);
  };

  const acceptSuggestion = () => {
    if (suggestedQuestion) {
      addQuestionToList(suggestedQuestion, validationFeedback || undefined);
      toast.success("Added suggested question");
    }
  };

  const rejectSuggestion = () => {
    // Use the original question instead
    addQuestionToList(customQuestion.trim(), validationFeedback || undefined);
    setSuggestedQuestion(null);
    setShowSuggestion(false);
  };

  const cancelAddQuestion = () => {
    setCustomQuestion("");
    setCustomExplanation("");
    setShowExplanationInput(false);
    setSuggestedQuestion(null);
    setShowSuggestion(false);
    setValidationFeedback(null);
  };

  return {
    customQuestion,
    setCustomQuestion,
    customExplanation,
    setCustomExplanation,
    validating,
    validationFeedback,
    showExplanationInput,
    validateAndAddCustomQuestion,
    cancelAddQuestion,
    suggestedQuestion,
    showSuggestion,
    acceptSuggestion,
    rejectSuggestion
  };
}
