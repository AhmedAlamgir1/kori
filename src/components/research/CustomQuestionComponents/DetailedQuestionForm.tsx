
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormActions from "./FormActions";

interface DetailedQuestionFormProps {
  customQuestion: string;
  setCustomQuestion: (value: string) => void;
  customExplanation: string;
  setCustomExplanation: (value: string) => void;
  validating: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const DetailedQuestionForm: React.FC<DetailedQuestionFormProps> = ({
  customQuestion,
  setCustomQuestion,
  customExplanation,
  setCustomExplanation,
  validating,
  onSubmit,
  onCancel
}) => {
  const isValid = customQuestion.trim() !== "" && customExplanation.trim() !== "";

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="customQuestion" className="text-sm text-blue-200/80 mb-1 block">Question</Label>
        <Input
          id="customQuestion"
          placeholder="Your question..."
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          className="bg-slate-700/50"
          disabled={validating}
        />
      </div>
      <div>
        <Label htmlFor="customExplanation" className="text-sm text-blue-200/80 mb-1 block">
          Rationale (Why are you asking this question?)
        </Label>
        <Textarea
          id="customExplanation"
          placeholder="Explain why you're asking this question and what you hope to learn (e.g., understand habits, identify pain points, etc.)"
          value={customExplanation}
          onChange={(e) => setCustomExplanation(e.target.value)}
          className="bg-slate-700/50 min-h-[80px]"
          disabled={validating}
        />
      </div>
      
      <FormActions 
        onCancel={onCancel}
        onSubmit={onSubmit}
        validating={validating}
        isValid={isValid}
      />
    </div>
  );
};

export default DetailedQuestionForm;
