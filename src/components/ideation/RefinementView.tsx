import React from "react";
import { ProductIdea } from "../../types";
import IdeaCard from "../IdeaCard";
import { Button } from "@/components/ui/button";
import RefinementDecks from "../refinement/RefinementDecks";

interface RefinementViewProps {
  problemStatement: {
    opportunity: string;
    problem: string;
  };
  selectedIdea: ProductIdea;
  onBackToIdeas: () => void;
  onReset: () => void;
  onExportRefinedIdeas: () => void;
}

const RefinementView: React.FC<RefinementViewProps> = ({
  problemStatement,
  selectedIdea,
  onBackToIdeas,
  onReset,
  onExportRefinedIdeas
}) => {
  return (
    <>
      <section className="mb-8 max-w-6xl mx-auto bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-indigo-500/30">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">Ideation Session</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBackToIdeas}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              Back to Ideas
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              Start Over
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-blue-200">Opportunity Area:</h4>
            <p className="text-white">{problemStatement.opportunity}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-200">Problem Statement:</h4>
            <p className="text-white">{problemStatement.problem}</p>
          </div>
        </div>
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1 md:sticky md:top-6 self-start">
          <IdeaCard 
            idea={selectedIdea} 
            index={0}
          />
        </div>
        <div className="md:col-span-2 overflow-y-auto">
          <RefinementDecks 
            selectedIdeas={[selectedIdea]}
            onExportRefinedIdeas={onExportRefinedIdeas}
            problemStatement={problemStatement}
          />
        </div>
      </div>
    </>
  );
};

export default RefinementView;
