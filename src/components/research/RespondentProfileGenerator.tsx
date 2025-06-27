import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimation";
import { generateRespondentProfiles } from "@/utils/researchService";
import ProfileForm from "./profile";
import { RespondentProfile } from "./profile/types";
import ProfileContainer from "./profiles/ProfileContainer";
import ProfileGrid from "./profiles/ProfileGrid";
import ProfileActions from "./profiles/ProfileActions";
import { navigateToTab } from "./ResearchDashboard";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import useProfileStore from "@/stores/useProfileStore";

interface RespondentProfileGeneratorProps {
  opportunity: string;
  researchApproach?: "explorative" | "evaluative";
}

const RespondentProfileGenerator: React.FC<RespondentProfileGeneratorProps> = ({
  opportunity,
  researchApproach = "explorative"
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddProfileForm, setShowAddProfileForm] = useState(false);
  
  // Use the Zustand store instead of local state
  const { 
    profiles, 
    setProfiles, 
    selectedProfileIndex, 
    selectProfile, 
    regenerationsLeft, 
    decrementRegenerations, 
    resetRegenerations 
  } = useProfileStore();

  const fetchProfiles = async () => {
    if (regenerationsLeft <= 0) {
      toast.error("You've reached the maximum number of regenerations (3)");
      return;
    }

    setLoading(true);
    setError(null);
    selectProfile(null); // Clear selected profile
    
    try {
      const generatedProfiles = await generateRespondentProfiles(opportunity, researchApproach);
      setProfiles(generatedProfiles);
      decrementRegenerations();
      if (regenerationsLeft <= 1) {
        toast.warning("This is your last regeneration!");
      }
    } catch (err) {
      setError("Failed to generate respondent profiles. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (index: number) => {
    // If clicking the same profile, deselect it
    if (selectedProfileIndex === index) {
      selectProfile(null);
      return;
    }

    // Otherwise, select the new profile
    selectProfile(index);
  };

  const handleAddCustomProfile = (newProfile: RespondentProfile) => {
    // Add the custom profile to the existing profiles
    const profileWithCustomFlag = { ...newProfile, isCustom: true };
    const updatedProfiles = [...profiles, profileWithCustomFlag];
    setProfiles(updatedProfiles);
    setShowAddProfileForm(false);
    toast.success("Custom profile added successfully!");
  };
  
  const handleInterviewQuestionsClick = () => {
    if (selectedProfileIndex === null) {
      toast.error("Please select a profile before proceeding to interview questions");
      return;
    }
    
    // Navigate to questions tab
    navigateToTab("questions");
  };
  
  const handleMockInterviewClick = () => {
    if (selectedProfileIndex === null) {
      toast.error("Please select a profile before proceeding to mock interview");
      return;
    }
    
    // Navigate to chat tab
    navigateToTab("chat");
  };

  useEffect(() => {
    resetRegenerations();
    fetchProfiles();
  }, [opportunity, researchApproach]);


  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-4 mb-6">
        <h3 className="text-2xl font-semibold text-white mb-4">Respondent Profiles Inspiration Board</h3>
        <p className="text-blue-200/80">
          These imaginary profiles represent diverse fictional respondents who might provide unique insights about your opportunity: <span className="text-indigo-300">{opportunity}</span>
        </p>
        <p className="text-blue-200/80 mt-2">
          Although these profiles are fictional, we hope it inspires you to diversify your respondent pool in real life.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <LoadingAnimation message="Generating diverse respondent profiles..." />
          </div>
        ) : (
          <>
            <ProfileGrid
              profiles={profiles}
              selectedProfileIndex={selectedProfileIndex}
              onSelectProfile={handleSelectProfile}
              onGenerateQuestions={handleInterviewQuestionsClick}
              onMockInterview={handleMockInterviewClick}
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => setShowAddProfileForm(true)}
                variant="outline"
                size="sm"
                className="text-purple-200/90 border-purple-500/30 hover:bg-purple-600/30"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Custom Profile
              </Button>
              <Button
                onClick={fetchProfiles}
                variant="outline"
                size="sm"
                className="text-blue-200/90 border-blue-500/30 hover:bg-blue-600/30"
                disabled={regenerationsLeft <= 0}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Generating...' : `Regenerate (${regenerationsLeft} left)`}
              </Button>
            </div>
          </>
        )}
      </div>

      <Dialog open={showAddProfileForm} onOpenChange={setShowAddProfileForm}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Create a Custom Profile</DialogTitle>
            <DialogDescription className="text-blue-200/80">
              Create a custom respondent profile to help tailor the research experience.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm
            opportunity={opportunity}
            onProfileAdded={handleAddCustomProfile}
            mode="respondent"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RespondentProfileGenerator;
