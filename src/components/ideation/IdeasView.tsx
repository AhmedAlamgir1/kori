import React from "react";
import { ProductIdea } from "../../types";
import IdeaCard from "../IdeaCard";
import { Button } from "@/components/ui/button";

interface IdeasViewProps {
  ideas: ProductIdea[];
  problemStatement: {
    opportunity: string;
    problem: string;
  };
  onRefineIdea: (idea: ProductIdea) => void;
  onReset: () => void;
}

const IdeasView: React.FC<IdeasViewProps> = ({ 
  ideas, 
  problemStatement, 
  onRefineIdea,
  onReset
}) => {
  if (!ideas.length) return null;
  
  return (
    <>
      <section className="mb-8 max-w-6xl mx-auto bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-indigo-500/30">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">Ideation Session</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            Start Over
          </Button>
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
      
      <section className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h3 className="text-3xl font-semibold text-blue-300 mb-2">Generated Product Ideas</h3>
          <p className="text-blue-200">
            Here are 8 potential product solutions for your innovation challenge. Click "Refine Idea" on any card to explore refinement options.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ideas.map((idea, index) => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              index={index}
              onRefine={onRefineIdea}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default IdeasView;
