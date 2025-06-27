
import React from "react";
import { RespondentProfile } from "../profile/types";
import ProfileCard from "./ProfileCard";

interface ProfileGridProps {
  profiles: RespondentProfile[];
  selectedProfileIndex: number | null;
  onSelectProfile: (index: number) => void;
  onGenerateQuestions: () => void;
  onMockInterview: () => void;
}

const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  selectedProfileIndex,
  onSelectProfile,
  onGenerateQuestions,
  onMockInterview
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {profiles.map((profile, index) => (
        <ProfileCard
          key={index}
          profile={profile}
          isSelected={selectedProfileIndex === index}
          onSelect={() => onSelectProfile(index)}
          onGenerateQuestions={onGenerateQuestions}
          onMockInterview={onMockInterview}
        />
      ))}
    </div>
  );
};

export default ProfileGrid;
