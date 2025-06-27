import React from "react";
import { ProblemStatement } from "../../types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OpportunityField from "./form/OpportunityField";
import ProblemField from "./form/ProblemField";
import { useGenerateIdeasForm } from "../../hooks/useGenerateIdeasForm";

interface GenerateIdeasFormProps {
  onSubmit: (data: ProblemStatement) => void;
  isLoading: boolean;
}

const GenerateIdeasForm: React.FC<GenerateIdeasFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const {
    opportunity,
    problem,
    touched,
    validating,
    problemWords,
    isFormValid,
    showOpportunityError,
    showProblemEmptyError,
    setOpportunity,
    setProblem,
    setTouched,
    handleSubmit
  } = useGenerateIdeasForm({ onSubmit, isLoading });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <OpportunityField
          value={opportunity}
          onChange={setOpportunity}
          onBlur={() => setTouched({ ...touched, opportunity: true })}
          showError={showOpportunityError}
          disabled={isLoading || validating}
        />
        
        <ProblemField
          value={problem}
          onChange={setProblem}
          onBlur={() => setTouched({ ...touched, problem: true })}
          wordCount={problemWords}
          showEmptyError={showProblemEmptyError}
          disabled={isLoading || validating}
        />
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || validating || !isFormValid}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : validating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          "Let's Ideate"
        )}
      </Button>
      
      <div className="space-y-1">
        <p className="text-sm text-white/70">
          Being detailed (e.g., with target audience) can help us generate more relevant information for your project.
        </p>
        <p className="text-sm text-white/70">
          * indicates a required question
        </p>
      </div>
    </form>
  );
};

export default GenerateIdeasForm;
