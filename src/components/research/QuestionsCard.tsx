import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Copy, UserPlus, UserRound } from "lucide-react";
import QuestionsList from "./QuestionsList";
import CustomQuestionForm from "./CustomQuestionForm";
import { QuestionWithExplanation } from "@/utils/research/interviewQuestionTypes";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RespondentProfile } from "./profile/types";
import useProfileStore from "@/stores/useProfileStore";

interface QuestionsCardProps {
  questionsWithExplanations: QuestionWithExplanation[];
  customQuestion: string;
  setCustomQuestion: (value: string) => void;
  customExplanation: string;
  setCustomExplanation: (value: string) => void;
  showExplanationInput: boolean;
  validating: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  suggestedQuestion?: string | null;
  showSuggestion?: boolean;
  onAcceptSuggestion?: () => void;
  onRejectSuggestion?: () => void;
  selectedProfile?: RespondentProfile | null;
  opportunity: string;
  onChangeProfile: (profile?: RespondentProfile) => void;
}

const QuestionsCard: React.FC<QuestionsCardProps> = ({
  questionsWithExplanations,
  customQuestion,
  setCustomQuestion,
  customExplanation,
  setCustomExplanation,
  showExplanationInput,
  validating,
  onSubmit,
  onCancel,
  suggestedQuestion,
  showSuggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
  selectedProfile,
  opportunity,
  onChangeProfile
}) => {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [profiles, setProfiles] = useState<RespondentProfile[]>([]);
  const [pendingProfile, setPendingProfile] = useState<RespondentProfile | null>(null);

  // Get profiles from Zustand store
  const { profiles: storeProfiles } = useProfileStore();
  
  // Update local profiles state when store profiles change
  useEffect(() => {
    setProfiles(storeProfiles);
  }, [storeProfiles]);

  const handleProfileSelect = (selectedProfile: RespondentProfile) => {
    setPendingProfile(selectedProfile);
    setShowProfileDialog(false);
    setShowConfirmDialog(true);
  };

  const { selectProfile } = useProfileStore();
  
  const confirmProfileChange = () => {
    if (pendingProfile) {
      // Find the profile in the store
      const profileIndex = storeProfiles.findIndex(p => 
        p.name === pendingProfile.name && 
        p.age === pendingProfile.age && 
        p.occupation === pendingProfile.occupation
      );
      
      if (profileIndex !== -1) {
        // Select the profile in the store
        selectProfile(profileIndex);
        
        // Update the profile in the parent component
        onChangeProfile(pendingProfile);
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

  const copyToClipboard = () => {
    const text = questionsWithExplanations
      .map((q, i) => `${i + 1}. ${q.question}\n   Purpose: ${q.explanation}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success("All questions copied to clipboard!");
  };

  return (
    <Card className="bg-slate-800/60 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5" />
          Interview Question Builder
          <span className="text-sm bg-indigo-500/30 border border-indigo-500/30 text-white px-2 py-1 ml-2 rounded-md">
            Drag questions to reorder
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-blue-200/80 space-y-4 text-base border-b border-slate-700 pb-4">
          <p className="text-white text-base">
            Respondent: {selectedProfile?.name}
            <span className="mx-2">•</span>
            {selectedProfile?.age} years old
            <span className="mx-2">•</span>
            {selectedProfile?.occupation}
            <span className="mx-2">•</span>
            on {opportunity}
          </p>
          <div>
            <span className="text-white font-medium">Background: </span>
            <span>{selectedProfile?.background}</span>
          </div>
          <div>
            <span className="text-white font-medium">Unique Perspective: </span>
            <span>{selectedProfile?.perspective}</span>
          </div>
        </div>

        <QuestionsList questions={questionsWithExplanations} />

        <div className="pt-2 border-t border-slate-700">
          <CustomQuestionForm
            customQuestion={customQuestion}
            setCustomQuestion={setCustomQuestion}
            customExplanation={customExplanation}
            setCustomExplanation={setCustomExplanation}
            showExplanationInput={showExplanationInput}
            validating={validating}
            onSubmit={onSubmit}
            onCancel={onCancel}
            suggestedQuestion={suggestedQuestion}
            showSuggestion={showSuggestion}
            onAcceptSuggestion={onAcceptSuggestion}
            onRejectSuggestion={onRejectSuggestion}
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4 border-t border-slate-700">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-white hover:text-white border-blue-500/30 hover:bg-blue-600/30"
          onClick={copyToClipboard}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy All Questions
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white"
          onClick={() => setShowProfileDialog(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Change Profile
        </Button>
      </CardFooter>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Select Profile</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-2">
              {profiles.map((p, index) => {
                const isCurrentProfile = selectedProfile && 
                  p.name === selectedProfile.name && 
                  p.age === selectedProfile.age && 
                  p.occupation === selectedProfile.occupation;
                
                return (
                  <button
                    key={index}
                    onClick={() => !isCurrentProfile && handleProfileSelect(p)}
                    disabled={isCurrentProfile}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isCurrentProfile
                        ? "bg-slate-700/50 border-indigo-500 cursor-not-allowed opacity-70"
                        : "bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
                    } border`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${
                        isCurrentProfile
                          ? "bg-indigo-500/50"
                          : "bg-slate-700/50"
                      }`}>
                        <UserRound className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {p.name}
                          {isCurrentProfile && (
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
                );
              })}
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
    </Card>
  );
};

export default QuestionsCard;
