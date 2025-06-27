
import React from "react";
import { toast } from "sonner";
import SyntheticUserForm from "./SyntheticUserForm";
import RespondentProfileForm from "./RespondentProfileForm";
import { ProfileFormProps, RespondentProfile } from "./types";
import { validateRespondentProfile } from "./validation";

const ProfileForm: React.FC<ProfileFormProps> = ({
  userProfile,
  setUserProfile,
  onSubmit,
  opportunity,
  onProfileAdded,
  mode = "synthetic-user"
}) => {
  const handleValidateProfile = async (profile: RespondentProfile) => {
    if (!opportunity) {
      toast.error("Research opportunity is required for validation");
      return null;
    }

    return await validateRespondentProfile(profile, opportunity);
  };

  const handleProfileAdded = (profile: RespondentProfile) => {
    if (onProfileAdded) {
      onProfileAdded(profile);
      toast.success(`${profile.name}'s profile has been added to your research`);
    }
  };

  // Render the synthetic user profile form
  if (mode === "synthetic-user" && userProfile && setUserProfile && onSubmit) {
    return (
      <SyntheticUserForm
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onSubmit={onSubmit}
      />
    );
  }

  // Render the respondent profile form
  return (
    <RespondentProfileForm
      opportunity={opportunity || ""}
      onProfileAdded={handleProfileAdded}
      onValidate={handleValidateProfile}
    />
  );
};

export default ProfileForm;
