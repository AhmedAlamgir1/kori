import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, FileText, MessageSquare, UserRound } from "lucide-react";
import { RespondentProfile } from "../profile/types";
import { toast } from "sonner";
import { navigateToTab } from "../ResearchDashboard";
import useProfileStore from "@/stores/useProfileStore";

interface ProfileCardProps {
  profile: RespondentProfile;
  isSelected: boolean;
  onSelect: () => void;
  onGenerateQuestions: () => void;
  onMockInterview: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isSelected,
  onSelect,
  onGenerateQuestions,
  onMockInterview
}) => {
  // Function to copy profile information to clipboard
  const handleCopyProfile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the select profile action
    
    const profileText = `
Name: ${profile.name}
Age: ${profile.age}
Occupation: ${profile.occupation}
Background: ${profile.background}
Unique Perspective: ${profile.perspective}
`.trim();

    navigator.clipboard.writeText(profileText)
      .then(() => {
        toast.success("Profile copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy profile:", err);
        toast.error("Failed to copy profile");
      });
  };

  const { selectProfile, profiles } = useProfileStore();

  const handleGenerateQuestions = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault();
    
    // Ensure the profile is selected in the global store
    const profileIndex = profiles.findIndex(p => 
      p.name === profile.name && 
      p.age === profile.age && 
      p.occupation === profile.occupation
    );
    
    if (profileIndex !== -1) {
      selectProfile(profileIndex);
    }
    
    // Call the provided handler which will handle navigation
    onGenerateQuestions();
  };

  const handleMockInterview = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault();
    
    // Ensure the profile is selected in the global store
    const profileIndex = profiles.findIndex(p => 
      p.name === profile.name && 
      p.age === profile.age && 
      p.occupation === profile.occupation
    );
    
    if (profileIndex !== -1) {
      selectProfile(profileIndex);
    }
    
    // Call the provided handler
    onMockInterview();
    
    // Then navigate to the chat tab
    navigateToTab("chat");
  };

  return (
    <Card 
      className={`bg-slate-800/60 border-indigo-500/30 ${isSelected ? 'ring-2 ring-indigo-400' : ''} cursor-pointer hover:bg-slate-800/80 transition-colors`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${isSelected ? 'bg-indigo-400' : 'bg-indigo-600'}`}>
              <UserRound className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                {profile.name}
                {isSelected && <CheckCircle className="h-4 w-4 text-green-400" />}
              </CardTitle>
              <CardDescription>{profile.age} • {profile.occupation}</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-indigo-300 hover:text-white"
            onClick={handleCopyProfile}
            title="Copy profile information"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-indigo-300">Background</h4>
          <p className="text-sm text-blue-100/90">{profile.background}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-indigo-300">Unique Perspective</h4>
          <p className="text-sm text-blue-100/90">{profile.perspective}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {isSelected ? (
          <div className="w-full space-y-2">
            <div className="text-center text-xs text-indigo-300 mb-2">
              What would you like to do with {profile.name}'s profile?
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full flex items-center gap-1"
                onClick={handleGenerateQuestions}
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs">Generate Questions</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full flex items-center gap-1"
                onClick={handleMockInterview}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Mock Interview</span>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white"
            onClick={onSelect}
          >
            <UserRound className="h-4 w-4 mr-2" />
            Use this profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;
