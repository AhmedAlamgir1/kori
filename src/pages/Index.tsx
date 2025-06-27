import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProblemStatementInput from "../components/ProblemStatementInput";
import LoadingAnimation from "../components/LoadingAnimation";
import { ProblemStatement, ProductIdea } from "../types";
import { generateIdeas } from "../utils/geminiService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import IdeasView from "../components/ideation/IdeasView";
import RefinementView from "../components/ideation/RefinementView";
import CustomRefinementView from "../components/ideation/CustomRefinementView";
import Footer from "@/components/ui/footer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [problemStatement, setProblemStatement] = useState<ProblemStatement | null>(null);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"generate" | "refine" | null>(null);
  const [refinementData, setRefinementData] = useState<any>(null);
  const [selectedIdeaForRefinement, setSelectedIdeaForRefinement] = useState<ProductIdea | null>(null);
  const [showRefinement, setShowRefinement] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleProblemStatementSubmit = async (newProblemStatement: ProblemStatement | any, selectedMode: "generate" | "refine") => {
    setIsLoading(true);
    try {
      console.log('Starting form submission...', { selectedMode });
      
      // Basic validation
      if (!newProblemStatement.opportunity.trim()) {
        toast.error("Opportunity area cannot be empty.");
        return;
      }

      if (!newProblemStatement.problem.trim()) {
        toast.error("Problem statement cannot be empty.");
        return;
      }

      // Additional validation for refine mode
      if (selectedMode === "refine") {
        console.log('Validating refine mode data...');
        if (!newProblemStatement.ideaTitle?.trim()) {
          toast.error("Idea title cannot be empty.");
          return;
        }

        if (!newProblemStatement.features?.length || !newProblemStatement.features.some(f => f.trim())) {
          toast.error("At least one feature is required.");
          return;
        }
      }

      // Set mode first
      console.log('Setting mode to:', selectedMode);
      setMode(selectedMode);
      setProblemStatement(newProblemStatement);
      
      // Make the API call here
      if (selectedMode === "generate") {
        const generatedIdeas = await generateIdeas(newProblemStatement);
        setIdeas(generatedIdeas.ideas);
      } else if (selectedMode === "refine") {
        // Set refinement data and show refinement view
        setRefinementData(newProblemStatement);
        setShowRefinement(true);
      }

    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToHome = () => {
    setPendingAction(() => () => {
      navigate("/");
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const handleRefineIdea = (idea: ProductIdea) => {
    setSelectedIdeaForRefinement(idea);
    setShowRefinement(true);
    toast.success(`Ready to refine: ${idea.title}`);
  };

  const resetForm = () => {
    setProblemStatement(null);
    setIdeas([]);
    setSelectedIdeaForRefinement(null);
    setShowRefinement(false);
    setMode(null);
    setRefinementData(null);
  };

  const handleBackToIdeas = () => {
    setSelectedIdeaForRefinement(null);
    setShowRefinement(false);
  };

  const handleExportRefinedIdeas = () => {
    toast.success("Refined ideas copied to clipboard in Markdown format!");
  };

  const getCustomIdeaFromRefinementData = () => {
    return {
      id: 1,
      title: refinementData.ideaTitle,
      description: "Your custom idea for refinement",
      rationale: refinementData.problem,
      features: refinementData.features.map((feature: string) => ({
        name: feature,
        description: ""
      }))
    };
  };

  // Add debug logging for render conditions
  console.log('Current state:', {
    mode,
    isLoading,
    hasRefinementData: !!refinementData,
    showRefinement
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white flex flex-col">
      <div className="absolute w-full h-full overflow-hidden z-0">
        <div className="stars-container"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Ideate
            </h1>
            
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
              </TooltipProvider>
            </div>
          </div>
          <p className="text-xl text-blue-200 mt-2">Your creative co-pilot to generate digital product solutions to problems</p>
        </div>

        <main className="flex-1 flex flex-col items-center justify-center pb-8">
          {isLoading ? (
            <LoadingAnimation />
          ) : showRefinement ? (
            mode === "refine" ? (
              <CustomRefinementView
                refinementData={refinementData}
                customIdea={getCustomIdeaFromRefinementData()}
                onReset={resetForm}
                onExportRefinedIdeas={handleExportRefinedIdeas}
              />
            ) : (
              <RefinementView
                problemStatement={{
                  opportunity: problemStatement?.opportunity || "",
                  problem: problemStatement?.problem || ""
                }}
                selectedIdea={selectedIdeaForRefinement!}
                onBackToIdeas={handleBackToIdeas}
                onReset={resetForm}
                onExportRefinedIdeas={handleExportRefinedIdeas}
              />
            )
          ) : (
            <>
              {!problemStatement ? (
                <div className="w-full max-w-3xl mx-auto">
                  <ProblemStatementInput onSubmit={handleProblemStatementSubmit} isLoading={isLoading} />
                </div>
              ) : (
                <IdeasView
                  ideas={ideas}
                  problemStatement={{
                    opportunity: problemStatement.opportunity,
                    problem: problemStatement.problem
                  }}
                  onRefineIdea={handleRefineIdea}
                  onReset={resetForm}
                />
              )}
            </>
          )}
        </main>

        <Footer />
      </div>

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

export default Index;
