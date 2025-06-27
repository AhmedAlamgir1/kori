import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Microscope } from "lucide-react";
import GenerateIdeasForm from "./GenerateIdeasForm";
import RefineIdeaForm from "./RefineIdeaForm";
import { ProblemStatement } from "../../types";
import { validateProblemStatement } from "../../utils/validation/problemStatementValidator";
import { toast } from "sonner";

interface ProblemStatementTabsProps {
  activeTab: "generate" | "refine";
  onTabChange: (value: "generate" | "refine") => void;
  onSubmit: (problemStatement: ProblemStatement | any, mode: "generate" | "refine") => void;
  isLoading: boolean;
}

const ProblemStatementTabs: React.FC<ProblemStatementTabsProps> = ({
  activeTab,
  onTabChange,
  onSubmit,
  isLoading
}) => {
  const handleGenerateSubmit = async (data: ProblemStatement) => {
    // Validate before submitting
    try {
      const validationResult = await validateProblemStatement(data.opportunity, data.problem);
      if (!validationResult.isValid) {
        toast.error(validationResult.message);
        return;
      }
      onSubmit(data, "generate");
    } catch (error) {
      toast.error("An error occurred during validation. Please try again.");
    }
  };

  const handleRefineSubmit = async (data: any) => {
    // Validate before submitting
    try {
      const validationResult = await validateProblemStatement(data.opportunity, data.problem);
      if (!validationResult.isValid) {
        toast.error(validationResult.message);
        return;
      }
      onSubmit(data, "refine");
    } catch (error) {
      toast.error("An error occurred during validation. Please try again.");
    }
  };

  return (
    <Tabs 
      value={activeTab}
      onValueChange={(value) => onTabChange(value as "generate" | "refine")}
      className="w-full"
    >
      <div className="mb-4">
        <div className="text-base mb-2 block text-slate-200">What do you want to do today?</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div 
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${activeTab === "generate" ? 'border-slate-600 bg-slate-800/80' : 'border-slate-700'}`}
            onClick={() => onTabChange("generate")}
          >
            <div className="flex items-start gap-2">
              <Search className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
              <div>
                <span className="font-medium block text-slate-200">Generate Ideas</span>
              </div>
            </div>
          </div>
          
          <div 
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${activeTab === "refine" ? 'border-slate-600 bg-slate-800/80' : 'border-slate-700'}`}
            onClick={() => onTabChange("refine")}
          >
            <div className="flex items-start gap-2">
              <Microscope className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
              <div>
                <span className="font-medium block text-slate-200">Refine Ideas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TabsContent value="generate" className="mt-0">
        <GenerateIdeasForm 
          onSubmit={handleGenerateSubmit}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="refine" className="mt-0">
        <RefineIdeaForm
          onSubmit={handleRefineSubmit}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProblemStatementTabs;
