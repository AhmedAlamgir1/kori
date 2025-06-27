import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ResearchBriefValidator from "@/components/research/ResearchBriefValidator";
import ResearchDashboard from "@/components/research/ResearchDashboard";
import ResearchOptionsGrid from "@/components/research/ResearchOptionsGrid";
import { Button } from "@/components/ui/button";
import { Edit, Home, Wrench } from "lucide-react";
import Footer from "@/components/ui/footer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useProfileStore from "@/stores/useProfileStore";

// Constants for research approaches to avoid magic strings
const RESEARCH_APPROACHES = {
  EXPLORATIVE: "explorative",
  EVALUATIVE: "evaluative",
} as const;

// Type definition for research approach
type ResearchApproach = typeof RESEARCH_APPROACHES.EXPLORATIVE | typeof RESEARCH_APPROACHES.EVALUATIVE;

const Understand = () => {
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<string>("");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [researchApproach, setResearchApproach] = useState<ResearchApproach>(RESEARCH_APPROACHES.EXPLORATIVE);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // This useEffect stores the opportunity in localStorage when it changes and is ready.
  // We're explicitly checking for `opportunity` not being empty.
  useEffect(() => {
    if (opportunity && isReady) {
      localStorage.setItem('currentResearchOpportunity', opportunity);
    }
  }, [opportunity, isReady]);

  const handleValidationSuccess = useCallback((approach: ResearchApproach) => {
    // Clear any previously selected research profile when a new opportunity is set
    const selectProfile = useProfileStore.getState().selectProfile;
    selectProfile(null);
    setResearchApproach(approach);
    setIsReady(true);
  }, []); // Dependencies are stable, so useCallback is fine.

  const handleSelectTool = useCallback((tool: string) => {
    console.log("Selected tool:", tool);
    setSelectedTool(tool);
  }, []); // No dependencies, so useCallback is fine.

  // Centralized function for actions requiring confirmation
  const triggerActionWithConfirmation = useCallback((action: () => void) => {
    setPendingAction(() => {
      // Wrap the action to also close the dialog upon execution
      return () => {
        action();
        setShowConfirmDialog(false); // Close dialog after action
      };
    });
    setShowConfirmDialog(true);
  }, []); // No dependencies, so useCallback is fine.

  const handleEditProject = useCallback(() => {
    triggerActionWithConfirmation(() => {
      setIsReady(false);
      setSelectedTool(null);
    });
  }, [triggerActionWithConfirmation]);

  const handleBackToTools = useCallback(() => {
    triggerActionWithConfirmation(() => {
      setSelectedTool(null);
    });
  }, [triggerActionWithConfirmation]);

  const navigateToHome = useCallback(() => {
    triggerActionWithConfirmation(() => {
      navigate("/");
    });
  }, [navigate, triggerActionWithConfirmation]);

  const handleConfirm = useCallback(() => {
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null); // Clear pending action regardless
  }, [pendingAction]);

  const handleCancel = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  }, []); // No dependencies, so useCallback is fine.

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white flex flex-col">
      <div className="absolute w-full h-full overflow-hidden z-0">
        {/* Placeholder for stars-container, ensure its CSS is defined elsewhere */}
        <div className="stars-container"></div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 relative z-10 flex flex-col">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {selectedTool ? (
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Understand Research Tools
              </h1>
            ) : (
              <div className="flex justify-between items-center w-full">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  Understand
                </h1>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={navigateToHome}
                      className="w-[46px] h-[46px] bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/50 rounded-xl"
                    >
                      <Home className="h-5 w-5 text-slate-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-slate-800/95 text-blue-100 border-slate-600">
                    <p>Return to home page</p>
                  </TooltipContent>
                </Tooltip>

                {isReady && !selectedTool && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleEditProject}
                        className="w-[46px] h-[46px] bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/50 rounded-xl"
                      >
                        <Edit className="h-5 w-5 text-slate-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-800/95 text-blue-100 border-slate-600">
                      <p>Edit research opportunity</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {selectedTool && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={handleEditProject}
                          className="w-[46px] h-[46px] bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/50 rounded-xl"
                        >
                          <Edit className="h-5 w-5 text-slate-300" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-slate-800/95 text-blue-100 border-slate-600">
                        <p>Edit research opportunity</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={handleBackToTools}
                          className="w-[46px] h-[46px] bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/50 rounded-xl"
                        >
                          <Wrench className="h-5 w-5 text-slate-300" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-slate-800/95 text-blue-100 border-slate-600">
                        <p>Go back to research tools</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </TooltipProvider>
            </div>
          </div>
          {!selectedTool && (
            <p className="text-xl text-blue-200 mt-2">Supercharge your innovation research to gain deeper insights into a problem</p>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {!isReady ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-indigo-500/30">
                <ResearchBriefValidator 
                  opportunity={opportunity} 
                  setOpportunity={setOpportunity} 
                  onValidationSuccess={handleValidationSuccess} 
                />
              </div>
            </div>
          ) : selectedTool ? (
            <ResearchDashboard 
              opportunity={opportunity} 
              researchApproach={researchApproach} 
              initialTab={selectedTool} 
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-6xl w-full">
                <ResearchOptionsGrid 
                  opportunity={opportunity} 
                  researchApproach={researchApproach} 
                  onSelectTool={handleSelectTool} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

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
              onClick={handleCancel}
              className="border-slate-600 text-blue-100 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
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

export default Understand;