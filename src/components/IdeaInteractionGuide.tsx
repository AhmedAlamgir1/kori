
import React from 'react';
import { Button } from "@/components/ui/button";
import { Star, Sparkles, X, MousePointerClick, Lightbulb } from "lucide-react";

interface IdeaInteractionGuideProps {
  onDismiss: () => void;
}

const IdeaInteractionGuide: React.FC<IdeaInteractionGuideProps> = ({ onDismiss }) => {
  return (
    <div className="mt-4 p-5 bg-indigo-600/30 rounded-lg border border-indigo-500/50 backdrop-blur-sm animate-fade-in relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6 text-blue-300 hover:text-white hover:bg-indigo-700/50"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <h4 className="text-lg font-semibold text-blue-100 mb-3 flex items-center">
        <Sparkles className="h-5 w-5 mr-2 text-amber-300" />
        How to interact with your ideas
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <div className="bg-slate-800/60 p-3 rounded-lg flex items-start space-x-3">
          <div className="bg-blue-700/60 rounded-full p-2 flex-shrink-0">
            <Star className="h-5 w-5 text-blue-200" />
          </div>
          <div>
            <h5 className="font-medium text-blue-200">1. Select Ideas</h5>
            <p className="text-sm text-blue-300">Click the star icon to add multiple ideas to your selection.</p>
          </div>
        </div>
        
        <div className="bg-slate-800/60 p-3 rounded-lg flex items-start space-x-3">
          <div className="bg-purple-700/60 rounded-full p-2 flex-shrink-0">
            <MousePointerClick className="h-5 w-5 text-purple-200" />
          </div>
          <div>
            <h5 className="font-medium text-blue-200">2. Show Refinement</h5>
            <p className="text-sm text-blue-300">Click "Show Refinement Tools" to expand the refinement interface.</p>
          </div>
        </div>
        
        <div className="bg-slate-800/60 p-3 rounded-lg flex items-start space-x-3">
          <div className="bg-green-700/60 rounded-full p-2 flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-green-200" />
          </div>
          <div>
            <h5 className="font-medium text-blue-200">3. Refine Ideas</h5>
            <p className="text-sm text-blue-300">Use the provided prompts to enhance and develop your selected ideas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaInteractionGuide;
