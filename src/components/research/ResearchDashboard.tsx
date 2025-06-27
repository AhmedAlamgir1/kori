import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed TabsContent as we'll conditionally render
import InterviewQuestionBuilder from "./InterviewQuestionBuilder";
import RespondentProfileGenerator from "./RespondentProfileGenerator";
import MockInterview from "./MockInterview";
// No longer need these icons/buttons directly within ResearchDashboard for tab management
// import { Button } from "@/components/ui/button";
// import { UserPlus2, RefreshCw } from "lucide-react"; 
import { RespondentProfile } from "./profile/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Re-added Button for dialog footer
import useProfileStore from "@/stores/useProfileStore";

interface ResearchDashboardProps {
  opportunity: string;
  researchApproach: "explorative" | "evaluative";
  initialTab?: string;
}

// Create a custom event for tab switching
export const navigateToTab = (tabValue: string) => {
  const event = new CustomEvent('research-dashboard-navigate', { 
    detail: { tabValue } 
  });
  document.dispatchEvent(event);
};

const ResearchDashboard: React.FC<ResearchDashboardProps> = ({ 
  opportunity, 
  researchApproach,
  initialTab = "profiles"
}) => {
  // Map the tool selection to tab values - fixed mapping to ensure consistent behavior
  const getTabValue = (tool?: string) => {
    switch(tool) {
      case "profiles": return "profiles";
      case "interview-questions": return "questions";
      case "mock-interview": return "chat";
      case "chat": return "chat"; // Added this case to handle when just "chat" is passed
      default: return "profiles";
    }
  };

  const [activeTab, setActiveTab] = useState<string>(getTabValue(initialTab));
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null);
  
  // Effect to set initial tab when component mounts or initialTab prop changes
  useEffect(() => {
    const tabValue = getTabValue(initialTab);
    setActiveTab(tabValue);
  }, [initialTab]);
  
  // Listen for custom navigation events
  useEffect(() => {
    const handleTabNavigation = (event: CustomEvent<{ tabValue: string }>) => {
      const { tabValue } = event.detail;
      handleTabChange(tabValue);
    };
    
    document.addEventListener('research-dashboard-navigate', handleTabNavigation as EventListener);
    
    return () => {
      document.removeEventListener('research-dashboard-navigate', handleTabNavigation as EventListener);
    };
  }, []);

  const handleTabChange = useCallback((value: string) => {
    // Only prompt for confirmation if the tab is actually changing
    // if (value === activeTab) return;
    // setPendingTabChange(value);
    // setShowConfirmDialog(true);
    setActiveTab(value)
  }, []); // Include activeTab in dependencies

  const confirmTabChange = useCallback(() => {
    if (pendingTabChange) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null); // Clear pending action after confirming
    }
    setShowConfirmDialog(false);
  }, [pendingTabChange]);

  const cancelTabChange = useCallback(() => {
    setPendingTabChange(null);
    setShowConfirmDialog(false);
  }, []);

  const { selectProfile, profiles } = useProfileStore();
  
  const handleProfileChange = useCallback((newProfile?: RespondentProfile) => {
    if (newProfile) {
      // Find the profile in the store
      const profileIndex = profiles.findIndex(p => 
        p.name === newProfile.name && 
        p.age === newProfile.age && 
        p.occupation === newProfile.occupation
      );
      
      if (profileIndex !== -1) {
        // Select the profile in the store
        selectProfile(profileIndex);
      } else {
        // If the profile doesn't exist in the store, add it first
        // This should be handled by the component that calls handleProfileChange
        console.warn("Profile not found in store");
      }
    } else {
      // Clear selected profile
      selectProfile(null);
    }
  }, [profiles, selectProfile]); // Dependencies include store values

  return (
    <div>
      {/* Use the value prop to control the active tab */}
      <Tabs value={activeTab} className="w-full">
        <TabsList className="mb-4 p-1 bg-slate-800/50 backdrop-blur-sm rounded-lg h-12">
          <TabsTrigger 
            value="profiles" 
            onClick={() => handleTabChange("profiles")} // Use onClick to trigger change handler
            className="text-lg data-[state=active]:bg-indigo-600/30 data-[state=active]:text-white data-[state=active]:shadow-sm text-blue-200/60 h-full"
          >
            Respondent Profiles
          </TabsTrigger>
          <TabsTrigger 
            value="questions" 
            onClick={() => handleTabChange("questions")} // Use onClick to trigger change handler
            className="text-lg data-[state=active]:bg-indigo-600/30 data-[state=active]:text-white data-[state=active]:shadow-sm text-blue-200/60 h-full"
          >
            Interview Questions
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            onClick={() => handleTabChange("chat")} // Use onClick to trigger change handler
            className="text-lg data-[state=active]:bg-indigo-600/30 data-[state=active]:text-white data-[state=active]:shadow-sm text-blue-200/60 h-full"
          >
            Mock Interview
          </TabsTrigger>
        </TabsList>
        
        {/* Conditionally render components based on activeTab */}
        <div className="tab-content-container">
          <div className={`${activeTab === "profiles" ? "block" : "hidden"} min-h-[400px]`}>
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <RespondentProfileGenerator opportunity={opportunity} researchApproach={researchApproach} />
              </div>
            </div>
          </div>

          <div className={`${activeTab === "questions" ? "block" : "hidden"} space-y-4 min-h-[400px]`}>
            <InterviewQuestionBuilder 
              opportunity={opportunity} 
              researchApproach={researchApproach} 
              onChangeProfile={handleProfileChange}
            />
          </div>

          <div className={`${activeTab === "chat" ? "block" : "hidden"} min-h-[400px]`}>
            <MockInterview 
              opportunity={opportunity}
              onChangeProfile={handleProfileChange}
            />
          </div>
        </div>
      </Tabs>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-indigo-500/30">
          <DialogHeader>
            <DialogTitle className="text-blue-100">Leave this section?</DialogTitle>
            <DialogDescription className="text-blue-200/80">
              You may lose unsaved data on this page if you proceed. Please make sure that you have made copies of your work.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={cancelTabChange}
              className="border-slate-600 text-blue-100 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmTabChange}
              className="bg-indigo-600/80 hover:bg-indigo-600 text-white border-0"
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResearchDashboard;