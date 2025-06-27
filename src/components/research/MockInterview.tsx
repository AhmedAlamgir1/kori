import React from "react";
import { RespondentProfile } from "./profile/types";
import MockInterviewChatbot from "./MockInterviewChatbot";
import MockInterviewHeader from "./MockInterviewHeader";
import useProfileStore from "@/stores/useProfileStore";

interface MockInterviewProps {
  opportunity: string;
  onChangeProfile?: (newProfile?: RespondentProfile) => void;
}

const MockInterview: React.FC<MockInterviewProps> = ({ opportunity, onChangeProfile }) => {
  // Use the Zustand store for profile management
  const { selectedProfile, selectProfile } = useProfileStore();

  const handleProfileChange = (newProfile?: RespondentProfile) => {
    if (newProfile) {
      // Find the profile in the store or add it if it doesn't exist
      const profiles = useProfileStore.getState().profiles;
      const profileIndex = profiles.findIndex(p => 
        p.name === newProfile.name && 
        p.age === newProfile.age && 
        p.occupation === newProfile.occupation
      );
      
      if (profileIndex !== -1) {
        selectProfile(profileIndex);
      } else {
        // If profile doesn't exist in store, add it and select it
        const updatedProfiles = [...profiles, newProfile];
        useProfileStore.getState().setProfiles(updatedProfiles);
        selectProfile(updatedProfiles.length - 1);
      }
      
      if (onChangeProfile) {
        onChangeProfile(newProfile);
      }
    } else {
      selectProfile(null);
      if (onChangeProfile) {
        onChangeProfile(undefined);
      }
    }
  };

  if (!selectedProfile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-white mb-4">No Profile Selected</h3>
        <p className="text-blue-200/80 max-w-2xl mx-auto">
          Please select or create a respondent profile first to start the mock interview.
          This will help tailor the conversation to your research needs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MockInterviewHeader
        profile={selectedProfile}
        opportunity={opportunity}
        onChangeProfile={handleProfileChange}
      />
      <MockInterviewChatbot 
        opportunity={opportunity} 
        profile={selectedProfile}
        onChangeProfile={handleProfileChange}
      />
    </div>
  );
};

export default MockInterview;
