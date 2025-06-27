import { useState } from "react";
import { validateProblemStatement } from "../utils/validation/problemStatementValidator";
import { toast } from "sonner";

export interface RefineIdeaFormData {
  opportunity: string;
  problem: string;
  ideaTitle: string;
  features: string[];
}

interface UseRefineIdeaFormProps {
  onSubmit: (data: RefineIdeaFormData) => void;
  isLoading: boolean;
}

export function useRefineIdeaForm({ onSubmit, isLoading }: UseRefineIdeaFormProps) {
  // Refine Idea form state
  const [refineOpportunity, setRefineOpportunity] = useState("");
  const [refineProblem, setRefineProblem] = useState("");
  const [ideaTitle, setIdeaTitle] = useState("");
  const [features, setFeatures] = useState(["", "", ""]);
  const [refineTouched, setRefineTouched] = useState({
    opportunity: false,
    problem: false,
    ideaTitle: false,
    features: [false, false, false]
  });
  const [validating, setValidating] = useState(false);

  // Word counter for problem statement
  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    setRefineTouched({
      opportunity: true,
      problem: true,
      ideaTitle: true,
      features: [true, true, true]
    });
    
    // Check word counts
    const problemWordCount = getWordCount(refineProblem);
    
    // At least 1 feature is required
    const hasAtLeastOneFeature = features.some(feature => feature.trim().length > 0);
    
    // Validate required fields
    if (
      refineOpportunity.trim() && 
      refineProblem.trim() && 
      problemWordCount >= 20 && 
      ideaTitle.trim() && 
      hasAtLeastOneFeature
    ) {
      try {
        // Create refinement data
        const refinementData = {
          opportunity: refineOpportunity,
          problem: refineProblem,
          ideaTitle: ideaTitle,
          features: features.filter(f => f.trim().length > 0)
        };
        
        onSubmit(refinementData);
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An error occurred while submitting the form.");
      }
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleFeatureBlur = (index: number) => {
    const newTouched = { ...refineTouched };
    newTouched.features[index] = true;
    setRefineTouched(newTouched);
  };

  // Refine validation states
  const refineOpportunityValid = refineOpportunity.trim().length > 0;
  const refineProblemWords = getWordCount(refineProblem);
  const refineProblemValid = refineProblem.trim().length > 0 && refineProblemWords >= 20;
  const ideaTitleValid = ideaTitle.trim().length > 0;
  const featureValid = features.some(feature => feature.trim().length > 0);
  const isRefineValid = refineOpportunityValid && refineProblemValid && ideaTitleValid && featureValid;
  
  const showRefineOpportunityError = refineTouched.opportunity && !refineOpportunityValid;
  const showRefineProblemLengthError = refineTouched.problem && refineProblem.trim().length > 0 && refineProblemWords < 20;
  const showRefineProblemEmptyError = refineTouched.problem && refineProblem.trim().length === 0;
  const showIdeaTitleError = refineTouched.ideaTitle && !ideaTitleValid;
  const showFeatureError = refineTouched.features.some((touched, index) => touched && features[index].trim().length === 0) && !featureValid;

  return {
    // State
    refineOpportunity,
    refineProblem,
    ideaTitle,
    features,
    refineTouched,
    validating,
    // Computed values
    refineProblemWords,
    isRefineValid,
    showRefineOpportunityError,
    showRefineProblemLengthError,
    showRefineProblemEmptyError,
    showIdeaTitleError,
    showFeatureError,
    // Handlers
    setRefineOpportunity,
    setRefineProblem,
    setIdeaTitle,
    handleFeatureChange,
    handleFeatureBlur,
    handleSubmit,
    setRefineTouched
  };
}
