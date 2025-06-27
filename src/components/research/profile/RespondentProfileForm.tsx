import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserRound } from "lucide-react";
import { RespondentProfile, ValidationFeedback } from "./types";
import ValidationFeedbackDisplay from "./ValidationFeedback";
import useProfileStore from "@/stores/useProfileStore";

interface RespondentProfileFormProps {
  opportunity: string;
  onProfileAdded: (profile: RespondentProfile) => void;
  onValidate: (profile: RespondentProfile) => Promise<ValidationFeedback | null>;
}

const RespondentProfileForm: React.FC<RespondentProfileFormProps> = ({
  opportunity,
  onProfileAdded,
  onValidate
}) => {
  const [customProfile, setCustomProfile] = useState<RespondentProfile>({
    name: "",
    age: "",
    occupation: "",
    background: "",
    perspective: ""
  });
  const [validating, setValidating] = useState(false);
  const [validationFeedback, setValidationFeedback] = useState<ValidationFeedback | null>(null);

  const handleCustomProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setCustomProfile(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear validation feedback when user edits
    if (validationFeedback) {
      setValidationFeedback(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidating(true);
    setValidationFeedback(null);
    
    try {
      const feedback = await onValidate(customProfile);
      setValidationFeedback(feedback);
      
      if (feedback?.isValid) {
        // Add the custom profile to the Zustand store
        const addProfile = useProfileStore.getState().addProfile;
        
        // Add the new custom profile with isCustom flag
        const profileWithFlag = {
          ...customProfile,
          isCustom: true // Add a flag to identify custom profiles
        };
        
        // Add to the Zustand store
        addProfile(profileWithFlag);
        
        // Notify parent component
        onProfileAdded(customProfile);
        
        // Reset form after successful submission
        setCustomProfile({
          name: "",
          age: "",
          occupation: "",
          background: "",
          perspective: ""
        });
      }
    } finally {
      setValidating(false);
    }
  };

  return (
    <Card className="bg-slate-800/60 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <UserRound className="h-5 w-5" />
          Add Your Own Respondent Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-200">Full Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Maria Rodriguez" 
                value={customProfile.name}
                onChange={handleCustomProfileChange}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-blue-200">Age</Label>
              <Input 
                id="age" 
                placeholder="e.g., 32" 
                value={customProfile.age}
                onChange={handleCustomProfileChange}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="text-blue-200">Occupation</Label>
            <Input 
              id="occupation" 
              placeholder="e.g., Environmental Sustainability Consultant" 
              value={customProfile.occupation}
              onChange={handleCustomProfileChange}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background" className="text-blue-200">Background & Experience</Label>
            <Textarea 
              id="background" 
              placeholder="Describe their relevant background, experience, and knowledge..." 
              value={customProfile.background}
              onChange={handleCustomProfileChange}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="perspective" className="text-blue-200">Unique Perspective</Label>
            <Textarea 
              id="perspective" 
              placeholder="What unique insights or viewpoints can they offer about the opportunity..." 
              value={customProfile.perspective}
              onChange={handleCustomProfileChange}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
            />
          </div>

          {validationFeedback && (
            <ValidationFeedbackDisplay feedback={validationFeedback} />
          )}

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={validating}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {validating ? "Validating..." : "Add Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RespondentProfileForm;
