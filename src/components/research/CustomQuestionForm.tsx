
import React from "react";
import SimpleQuestionInput from "./CustomQuestionComponents/SimpleQuestionInput";
import DetailedQuestionForm from "./CustomQuestionComponents/DetailedQuestionForm";
import SuggestionBox from "./CustomQuestionComponents/SuggestionBox";

interface CustomQuestionFormProps {
  customQuestion: string;
  setCustomQuestion: (value: string) => void;
  customExplanation: string;
  setCustomExplanation: (value: string) => void;
  showExplanationInput: boolean;
  validating: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  suggestedQuestion?: string | null;
  showSuggestion?: boolean;
  onAcceptSuggestion?: () => void;
  onRejectSuggestion?: () => void;
  validationFeedback?: string | null;
}

const CustomQuestionForm: React.FC<CustomQuestionFormProps> = ({
  customQuestion,
  setCustomQuestion,
  customExplanation,
  setCustomExplanation,
  showExplanationInput,
  validating,
  onSubmit,
  onCancel,
  suggestedQuestion,
  showSuggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
  validationFeedback
}) => {
  // If we have a suggestion to show, display the suggestion box
  if (showSuggestion && suggestedQuestion && onAcceptSuggestion && onRejectSuggestion) {
    return (
      <SuggestionBox
        originalQuestion={customQuestion}
        suggestedQuestion={suggestedQuestion}
        feedback={validationFeedback || undefined}
        onAccept={onAcceptSuggestion}
        onReject={onRejectSuggestion}
      />
    );
  }

  // Simple input mode
  if (!showExplanationInput) {
    return (
      <SimpleQuestionInput 
        customQuestion={customQuestion}
        setCustomQuestion={setCustomQuestion}
        validating={validating}
        onSubmit={onSubmit}
      />
    );
  }

  // Detailed form mode
  return (
    <DetailedQuestionForm
      customQuestion={customQuestion}
      setCustomQuestion={setCustomQuestion}
      customExplanation={customExplanation}
      setCustomExplanation={setCustomExplanation}
      validating={validating}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

export default CustomQuestionForm;
