import React, { useState } from "react";
import { RespondentProfile } from "./profile/types";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRound } from "lucide-react";
import { useInterviewQuestionContext } from "@/contexts/InterviewQuestionContext";
import useProfileStore from "@/stores/useProfileStore";

interface QuestionHeaderProps {
  opportunity: string;
  selectedProfile: RespondentProfile | null;
  onChangeProfile?: (newProfile?: RespondentProfile) => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ opportunity, selectedProfile, onChangeProfile }) => {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<RespondentProfile | null>(null);
  const { fetchQuestions } = useInterviewQuestionContext();
  
  // Use the Zustand store for profiles
  const { profiles, selectProfile } = useProfileStore();



  const handleProfileSelect = (profile: RespondentProfile) => {
    setPendingProfile(profile);
    setShowProfileDialog(false);
    setShowConfirmDialog(true);
  };

  const confirmProfileChange = () => {
    if (pendingProfile) {
      // Find the profile in the store
      const profileIndex = profiles.findIndex(p => 
        p.name === pendingProfile.name && 
        p.age === pendingProfile.age && 
        p.occupation === pendingProfile.occupation
      );
      
      if (profileIndex !== -1) {
        // Select the profile in the store
        selectProfile(profileIndex);
        
        // Update the profile in the parent component if needed
        onChangeProfile?.(pendingProfile);
        
        // Trigger question regeneration with the new profile
        fetchQuestions(true);
      }
    }
    setShowConfirmDialog(false);
    setPendingProfile(null);
  };

  const cancelProfileChange = () => {
    setShowConfirmDialog(false);
    setPendingProfile(null);
    setShowProfileDialog(true);
  };

  return (
    <div className="flex flex-col space-y-4">
      {selectedProfile && (
        <>
          <div className="bg-slate-800/60 border border-indigo-500/30 rounded-lg p-4 mt-4">
            <div className="space-y-4">
              <p className="text-white text-base">
                Respondent: {selectedProfile.name}
                <span className="mx-2">•</span>
                {selectedProfile.age} years old
                <span className="mx-2">•</span>
                {selectedProfile.occupation}
                <span className="mx-2">•</span>
                on {opportunity}
              </p>
              <div className="text-blue-200/80 space-y-4 text-base">
                <div>
                  <span className="text-white font-medium">Background: </span>
                  <span>{selectedProfile.background}</span>
                </div>
                <div>
                  <span className="text-white font-medium">Unique Perspective: </span>
                  <span>{selectedProfile.perspective}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {onChangeProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileDialog(true)}
                className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Change Profile
              </Button>
            )}
          </div>
        </>
      )}

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Select Profile</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-2">
              {profiles.map((p, index) => (
                <button
                  key={index}
                  onClick={() => handleProfileSelect(p)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedProfile && p.name === selectedProfile.name && p.age === selectedProfile.age && p.occupation === selectedProfile.occupation
                      ? "bg-slate-700/50 border-indigo-500"
                      : "bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
                  } border`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      selectedProfile && p.name === selectedProfile.name && p.age === selectedProfile.age && p.occupation === selectedProfile.occupation
                        ? "bg-indigo-500/50"
                        : "bg-slate-700/50"
                    }`}>
                      <UserRound className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {p.name}
                        {selectedProfile && p.name === selectedProfile.name && p.age === selectedProfile.age && p.occupation === selectedProfile.occupation && (
                          <span className="text-blue-200/80">(current profile)</span>
                        )}
                        {p.isCustom && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">Custom</span>
                        )}
                      </div>
                      <div className="text-sm text-blue-200/80">
                        {p.age} • {p.occupation}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-indigo-500/30">
          <DialogHeader>
            <DialogTitle className="text-blue-100">Change Profile?</DialogTitle>
            <DialogDescription className="text-blue-200/80">
              Changing profiles will reset your current session. Please make sure you have saved or copied any important work before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={cancelProfileChange}
              className="border-slate-600 text-blue-100 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmProfileChange}
              className="bg-indigo-600/80 hover:bg-indigo-600 text-white border-0"
            >
              Change Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionHeader;
