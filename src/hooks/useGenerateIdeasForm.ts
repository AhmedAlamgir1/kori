import { useState } from "react";
import { ProblemStatement } from "../types";
import { validateInput } from "../utils/geminiService";
import { toast } from "sonner";

interface UseGenerateIdeasFormProps {
  onSubmit: (data: ProblemStatement) => void;
  isLoading: boolean;
}

export function useGenerateIdeasForm({ onSubmit, isLoading }: UseGenerateIdeasFormProps) {
  const [opportunity, setOpportunity] = useState("");
  const [problem, setProblem] = useState("");
  const [touched, setTouched] = useState({ opportunity: false, problem: false });
  const [validating, setValidating] = useState(false);

  // Count words for validation
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const problemWords = countWords(problem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input before showing loading state
    const problemStatement = { opportunity, problem };
    setValidating(true);
    
    const validation = validateInput(problemStatement);
    if (!validation.isValid) {
      toast.error(validation.error);
      setValidating(false);
      return;
    }
    
    setValidating(false);
    onSubmit(problemStatement);
  };

  // Basic validation
  const opportunityValid = opportunity.trim().length > 0;
  const problemValid = problem.trim().length > 0;
  const isFormValid = opportunityValid && problemValid;

  const showOpportunityError = touched.opportunity && !opportunityValid;
  const showProblemEmptyError = touched.problem && !problemValid;

  return {
    // State
    opportunity,
    problem,
    touched,
    validating,
    // Computed values
    problemWords,
    isFormValid,
    showOpportunityError,
    showProblemEmptyError,
    // Handlers
    setOpportunity,
    setProblem,
    setTouched,
    handleSubmit
  };
}
