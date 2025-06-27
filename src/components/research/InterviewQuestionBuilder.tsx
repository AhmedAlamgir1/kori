import React from "react";
import { InterviewQuestionProvider } from "@/contexts/InterviewQuestionContext";
import InterviewQuestionContent from "./InterviewQuestionContent";
import { RespondentProfile } from "./profile/types";

interface InterviewQuestionBuilderProps {
  opportunity: string;
  researchApproach?: "explorative" | "evaluative";
  onChangeProfile?: (newProfile?: RespondentProfile) => void;
}

const InterviewQuestionBuilder: React.FC<InterviewQuestionBuilderProps> = ({ 
  opportunity, 
  researchApproach = "explorative",
  onChangeProfile
}) => {
  return (
    <InterviewQuestionProvider opportunity={opportunity} researchApproach={researchApproach}>
      <InterviewQuestionContent onChangeProfile={onChangeProfile} />
    </InterviewQuestionProvider>
  );
};

export default InterviewQuestionBuilder;
