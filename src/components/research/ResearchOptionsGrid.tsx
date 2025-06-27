import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Bot, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ProfileForm from "./profile";
import { RespondentProfile } from "./profile/types";
import { toast } from "sonner";
import useProfileStore from "@/stores/useProfileStore";

interface ResearchOptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ResearchOption: React.FC<ResearchOptionProps> = ({ 
  title, 
  description, 
  icon, 
  onClick
}) => (
  <Card className="bg-slate-800/60 border-indigo-500/30 hover:border-indigo-400/50 transition-all hover:shadow-md hover:shadow-indigo-500/20 flex flex-col min-h-[320px]">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="rounded-full bg-indigo-600/30 p-3 w-fit">
          {icon}
        </div>
      </div>
      <CardTitle className="mt-4 text-xl text-white">{title}</CardTitle>
      <CardDescription className="text-blue-200/80 text-sm">{description}</CardDescription>
    </CardHeader>
    <CardContent className="text-sm text-blue-100/70 flex-grow">
      {title === "Respondent Profiles" && (
        <p>Generate diverse user personas who might engage with your product or service. Each profile includes background, needs, and unique perspectives.</p>
      )}
      {title === "Interview Questions" && (
        <p>Create a structured set of user research questions tailored to your opportunity area. Includes purpose explanations and categorization by interview phase.</p>
      )}
      {title === "Mock Interview" && (
        <p>Simulate conversations with AI-generated users based on your custom profiles. Test your interview questions and get realistic responses.</p>
      )}
    </CardContent>
    <CardFooter className="mt-auto">
      <Button 
        onClick={onClick}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        Select This Tool
      </Button>
    </CardFooter>
  </Card>
);

interface ResearchOptionsGridProps {
  opportunity: string;
  researchApproach: "explorative" | "evaluative";
  onSelectTool: (tool: string) => void;
}

const ResearchOptionsGrid: React.FC<ResearchOptionsGridProps> = ({ opportunity, researchApproach, onSelectTool }) => {
  const [showProfileDialog, setShowProfileDialog] = React.useState(false);
  const [selectedProfile, setSelectedProfile] = React.useState<RespondentProfile | null>(null);
  const [selectedTool, setSelectedTool] = React.useState<string | null>(null);

  // Get the selected profile from Zustand store
  const { selectedProfile: storeSelectedProfile } = useProfileStore();
  
  React.useEffect(() => {
    if (storeSelectedProfile) {
      setSelectedProfile(storeSelectedProfile);
    }
  }, [storeSelectedProfile]);

  const { selectProfile, profiles, addProfile } = useProfileStore();
  
  const handleProfileAdded = (profile: RespondentProfile) => {
    // Find if the profile already exists in the store
    const profileIndex = profiles.findIndex(p => 
      p.name === profile.name && 
      p.age === profile.age && 
      p.occupation === profile.occupation
    );
    
    if (profileIndex !== -1) {
      // If profile exists, just select it
      selectProfile(profileIndex);
    } else {
      // If profile doesn't exist, add it to the store with isCustom flag
      const profileWithFlag = { ...profile, isCustom: true };
      addProfile(profileWithFlag);
      
      // Select the newly added profile (it will be at the end of the array)
      selectProfile(profiles.length);
    }
    
    setSelectedProfile(profile);
    setShowProfileDialog(false);
    
    // After profile is added, navigate to the previously selected tool
    if (selectedTool) {
      onSelectTool(selectedTool);
    }
  };

  const handleToolSelect = (tool: string) => {
    if (tool === "profiles") {
      onSelectTool(tool);
      return;
    }

    if (!selectedProfile) {
      setSelectedTool(tool); // Store the selected tool
      setShowProfileDialog(true); // Show profile dialog
      return;
    }

    onSelectTool(tool);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Research Tools</h2>
        <p className="text-blue-200/80 max-w-3xl mx-auto">
          Choose a research tool to gain deeper insights about your opportunity: 
          <span className="font-semibold text-indigo-300 ml-2">{opportunity}</span>
        </p>
      </div>

      {selectedProfile && (
        <div className="flex justify-between items-center">
          <div className="text-blue-200/80">
            Current Profile: <span className="text-indigo-300 font-medium">{selectedProfile.name}</span>
            <span className="text-blue-300/60 ml-2">({selectedProfile.age} • {selectedProfile.occupation})</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfileDialog(true)}
              className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Change Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Clear the selected profile in the Zustand store
                selectProfile(null);
                setSelectedProfile(null);
              }}
              className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white flex items-center justify-center gap-2"
            >
              Clear Profile
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResearchOption
          title="Respondent Profiles"
          description="Create diverse user personas"
          icon={<Users className="h-6 w-6 text-indigo-300" />}
          onClick={() => handleToolSelect("profiles")}
        />
        <ResearchOption
          title="Interview Questions"
          description="Generate effective research questions"
          icon={<FileText className="h-6 w-6 text-indigo-300" />}
          onClick={() => handleToolSelect("interview-questions")}
        />
        <ResearchOption
          title="Mock Interview"
          description="Simulate user interviews"
          icon={<Bot className="h-6 w-6 text-indigo-300" />}
          onClick={() => handleToolSelect("mock-interview")}
        />
      </div>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Create a Custom Profile</DialogTitle>
            <DialogDescription className="text-blue-200/80">
              To use the {selectedTool === "interview-questions" ? "Interview Questions" : "Mock Interview"} tool, 
              you'll need to create a custom profile first. This helps tailor the experience to your specific research needs.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm
            opportunity={opportunity}
            onProfileAdded={handleProfileAdded}
            mode="respondent"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResearchOptionsGrid;
