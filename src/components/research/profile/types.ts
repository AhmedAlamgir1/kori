import React from "react";

export interface RespondentProfile {
  name: string;
  age: string;
  occupation: string;
  background: string;
  perspective: string;
  isCustom?: boolean;
}

export interface UserProfile {
  age: string;
  gender: string;
  occupation: string;
  interests: string;
}

export interface ProfileFormProps {
  userProfile?: UserProfile;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSubmit?: (e: React.FormEvent) => void;
  opportunity?: string;
  onProfileAdded?: (profile: RespondentProfile) => void;
  mode?: "synthetic-user" | "respondent";
}

export interface ValidationFeedback {
  isValid: boolean;
  message: string;
}
