
import React from "react";
import { useRefineIdeaForm } from "../../hooks/useRefineIdeaForm";
import OpportunityField from "./form/OpportunityField";
import ProblemField from "./form/ProblemField";
import IdeaTitleField from "./form/IdeaTitleField";
import FeaturesField from "./form/FeaturesField";
import SubmitButton from "./form/SubmitButton";

interface RefineIdeaFormProps {
  onSubmit: (data: {
    opportunity: string;
    problem: string;
    ideaTitle: string;
    features: string[];
  }) => void;
  isLoading: boolean;
}

const RefineIdeaForm: React.FC<RefineIdeaFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const {
    refineOpportunity,
    refineProblem,
    ideaTitle,
    features,
    refineTouched,
    validating,
    refineProblemWords,
    isRefineValid,
    showRefineOpportunityError,
    showRefineProblemLengthError,
    showRefineProblemEmptyError,
    showIdeaTitleError,
    showFeatureError,
    setRefineOpportunity,
    setRefineProblem,
    setIdeaTitle,
    handleFeatureChange,
    handleFeatureBlur,
    handleSubmit,
    setRefineTouched
  } = useRefineIdeaForm({ onSubmit, isLoading });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <OpportunityField
          value={refineOpportunity}
          onChange={setRefineOpportunity}
          onBlur={() => setRefineTouched({ ...refineTouched, opportunity: true })}
          showError={showRefineOpportunityError}
          disabled={isLoading || validating}
        />
        
        <ProblemField
          value={refineProblem}
          onChange={setRefineProblem}
          onBlur={() => setRefineTouched({ ...refineTouched, problem: true })}
          wordCount={refineProblemWords}
          showEmptyError={showRefineProblemEmptyError}
          showLengthError={showRefineProblemLengthError}
          disabled={isLoading || validating}
        />

        <IdeaTitleField
          value={ideaTitle}
          onChange={setIdeaTitle}
          onBlur={() => setRefineTouched({ ...refineTouched, ideaTitle: true })}
          showError={showIdeaTitleError}
          disabled={isLoading || validating}
        />

        <FeaturesField
          features={features}
          onChange={handleFeatureChange}
          onBlur={handleFeatureBlur}
          showError={showFeatureError}
          touched={refineTouched.features}
          disabled={isLoading || validating}
        />
      </div>
      
      <SubmitButton
        isLoading={isLoading}
        isValidating={validating}
        isValid={isRefineValid}
      />
    </form>
  );
};

export default RefineIdeaForm;
