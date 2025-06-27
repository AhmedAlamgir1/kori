
import { useInterviewQuestionContext } from "@/contexts/InterviewQuestionContext";
import type { QuestionWithExplanation } from "@/utils/research/interviewQuestionTypes";

// Re-export the QuestionWithExplanation type for convenience
export type { QuestionWithExplanation };

/**
 * Custom hook that provides access to interview question context
 * and related functionality
 */
export function useInterviewQuestions() {
  const context = useInterviewQuestionContext();
  return context;
}
