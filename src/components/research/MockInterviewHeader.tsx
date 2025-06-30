import React from "react";
import { RespondentProfile } from "./profile/types";

interface MockInterviewHeaderProps {
  profile: RespondentProfile;
  opportunity: string;
  onChangeProfile?: (newProfile?: RespondentProfile) => void;
}

const MockInterviewHeader: React.FC<MockInterviewHeaderProps> = ({ profile, opportunity, onChangeProfile }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <div>
            <p className="text-white text-base">
              Respondent: {profile.name}
              <span className="mx-2">•</span>
              {profile.age} years old
              <span className="mx-2">•</span>
              {profile.occupation}
              <span className="mx-2">•</span>
              on {opportunity}
            </p>
          </div>
          
          <div className="text-blue-200/80 space-y-4">
            <div>
              <span className="text-white font-medium">Background: </span>
              <span className="text-base">{profile.background}</span>
            </div>
            <div>
              <span className="text-white font-medium">Unique Perspective: </span>
              <span className="text-base">{profile.perspective}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewHeader;
