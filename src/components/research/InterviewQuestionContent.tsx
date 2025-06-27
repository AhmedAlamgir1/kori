import React from "react";
import LoadingAnimation from "@/components/LoadingAnimation";
import { RespondentProfile } from "./profile/types";

import QuestionsList from "./QuestionsList";
import CustomQuestionForm from "./CustomQuestionForm";
import QuestionActions from "./QuestionActions";
import { useInterviewQuestions } from "@/hooks/useInterviewQuestions";
import { useCustomQuestionInput } from "@/hooks/useCustomQuestionInput";
import QuestionHeader from "./QuestionHeader";
import ErrorDisplay from "./ErrorDisplay";
import QuestionsCard from "./QuestionsCard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import useProfileStore from "@/stores/useProfileStore";

interface InterviewQuestionContentProps {
  onChangeProfile?: (newProfile?: RespondentProfile) => void;
}

const InterviewQuestionContent: React.FC<InterviewQuestionContentProps> = ({ onChangeProfile }) => {
  const {
    questionsWithExplanations,
    loading,
    error,
    fetchQuestions,
    addCustomQuestion,
    opportunity,
    selectedProfile,
    regenerationsLeft
  } = useInterviewQuestions();

  const { selectProfile, profiles } = useProfileStore();

  // Handle profile changes
  const handleProfileChange = (newProfile?: RespondentProfile) => {
    if (newProfile) {
      // Find the profile in the store
      const profileIndex = profiles.findIndex(p => 
        p.name === newProfile.name && 
        p.age === newProfile.age && 
        p.occupation === newProfile.occupation
      );
      
      if (profileIndex !== -1) {
        // Select the profile in the store
        selectProfile(profileIndex);
        
        // Notify parent component if needed
        if (onChangeProfile) {
          onChangeProfile(newProfile);
        }
        
        // Trigger question regeneration with isProfileChange flag
        fetchQuestions(true);
      }
    } else {
      // Clear selected profile
      selectProfile(null);
      
      if (onChangeProfile) {
        onChangeProfile(undefined);
      }
    }
  };

  const {
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
  } = useCustomQuestionInput({
    opportunity,
    onQuestionAdd: addCustomQuestion
  });

  const copyToClipboard = () => {
    const text = questionsWithExplanations
      .map((q, i) => `${i + 1}. ${q.question}\n   Purpose: ${q.explanation}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return <LoadingAnimation message={
      selectedProfile && selectedProfile.name
        ? `Generating interview questions for ${selectedProfile.name}...` 
        : "Generating interview questions..."
    } />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorDisplay error={error} onRetry={fetchQuestions} />}
      
      <QuestionsCard
        questionsWithExplanations={questionsWithExplanations}
        customQuestion={customQuestion}
        setCustomQuestion={setCustomQuestion}
        customExplanation={customExplanation}
        setCustomExplanation={setCustomExplanation}
        showExplanationInput={showExplanationInput}
        validating={validating}
        onSubmit={validateAndAddCustomQuestion}
        onCancel={cancelAddQuestion}
        suggestedQuestion={suggestedQuestion}
        showSuggestion={showSuggestion}
        onAcceptSuggestion={acceptSuggestion}
        onRejectSuggestion={rejectSuggestion}
        selectedProfile={selectedProfile}
        opportunity={opportunity}
        onChangeProfile={handleProfileChange}
      />
    </div>
  );
};

export default InterviewQuestionContent;
