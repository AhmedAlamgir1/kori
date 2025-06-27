import { toast } from "sonner";
import { RespondentProfile } from "./types";

export const validateRespondentProfile = async (customProfile: RespondentProfile, opportunity: string) => {
  try {
    // Check that all required fields are filled
    const requiredFields = ["name", "age", "occupation", "background", "perspective"];
    const missingFields = requiredFields.filter(field => !customProfile[field as keyof RespondentProfile]);
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        message: `Please fill in all required fields: ${missingFields.join(", ")}`
      };
    }

    // Check for minimum content length in background and perspective
    if (customProfile.background.split(/\s+/).length < 10) {
      return {
        isValid: false,
        message: "Please provide more detail in the background section (at least 10 words)."
      };
    }

    if (customProfile.perspective.split(/\s+/).length < 10) {
      return {
        isValid: false,
        message: "Please provide more detail in the perspective section (at least 10 words)."
      };
    }

    // If all validations pass
    toast.success("Profile added successfully!");
    return {
      isValid: true,
      message: "Profile looks good!"
    };
    
  } catch (error) {
    console.error("Error validating profile:", error);
    return {
      isValid: false,
      message: "An error occurred during validation. Please try again."
    };
  }
};
