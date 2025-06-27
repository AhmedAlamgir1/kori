import React from "react";
import { ProductIdea } from "../types";
import { Lightbulb, BrainCircuit, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface IdeaCardProps {
  idea: ProductIdea;
  index: number;
  onRefine?: (idea: ProductIdea) => void; // Make onRefine optional
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index, onRefine }) => {
  // Animation delay based on index for staggered appearance
  const animationDelay = `${index * 100}ms`;
  
  // Define an array of color schemes
  const colorSchemes = [
    // Blue scheme
    {
      cardBg: "bg-gradient-to-br from-slate-800/90 to-indigo-950/90",
      accentColor: "text-blue-400",
      titleColor: "text-blue-200",
      featureBg: "bg-blue-900/30",
      featureAccent: "bg-blue-700/50",
    },
    // Purple scheme
    {
      cardBg: "bg-gradient-to-br from-purple-900/90 to-indigo-900/90",
      accentColor: "text-purple-400",
      titleColor: "text-purple-200",
      featureBg: "bg-purple-900/30",
      featureAccent: "bg-purple-700/50",
    },
    // Teal scheme
    {
      cardBg: "bg-gradient-to-br from-slate-800/90 to-teal-900/90",
      accentColor: "text-teal-400",
      titleColor: "text-teal-200",
      featureBg: "bg-teal-900/30",
      featureAccent: "bg-teal-700/50",
    },
    // Red scheme
    {
      cardBg: "bg-gradient-to-br from-slate-800/90 to-red-900/90",
      accentColor: "text-red-400",
      titleColor: "text-red-200",
      featureBg: "bg-red-900/30",
      featureAccent: "bg-red-700/50",
    },
    // Amber scheme
    {
      cardBg: "bg-gradient-to-br from-slate-800/90 to-amber-900/90",
      accentColor: "text-amber-400",
      titleColor: "text-amber-200",
      featureBg: "bg-amber-900/30",
      featureAccent: "bg-amber-700/50",
    },
    // Green scheme
    {
      cardBg: "bg-gradient-to-br from-slate-800/90 to-green-900/90",
      accentColor: "text-green-400",
      titleColor: "text-green-200",
      featureBg: "bg-green-900/30",
      featureAccent: "bg-green-700/50",
    },
    // Pink scheme
    {
      cardBg: "bg-gradient-to-br from-slate-800/90 to-pink-900/90",
      accentColor: "text-pink-400",
      titleColor: "text-pink-200",
      featureBg: "bg-pink-900/30",
      featureAccent: "bg-pink-700/50",
    },
    // Cyan scheme
    {
      cardBg: "bg-gradient-to-br from-slate-800/90 to-cyan-900/90",
      accentColor: "text-cyan-400",
      titleColor: "text-cyan-200",
      featureBg: "bg-cyan-900/30",
      featureAccent: "bg-cyan-700/50",
    },
  ];
  
  // Select a color scheme based on the idea's index
  const colorScheme = colorSchemes[index % colorSchemes.length];
  
  // Common colors for all cards
  const textColor = "text-slate-200";
  
  // Copy to clipboard handler
  const handleCopy = () => {
    const featuresList = idea.features.map((feature, i) => 
      `${i+1}. ${feature.name}: ${feature.description}`
    ).join('\n');
    
    const textToCopy = `${idea.title}\n\n${idea.description}\n\nRationale:\n${idea.rationale}\n\nKey Features:\n${featuresList}`;
    
    navigator.clipboard.writeText(textToCopy);
    toast.success("Idea copied to clipboard");
  };

  // Handle refinement
  const handleRefine = () => {
    if (onRefine) {
      onRefine(idea);
    }
  };
  
  return (
    <div
      className={`p-6 flex flex-col h-full animate-fade-up rounded-xl border border-slate-700/50 ${colorScheme.cardBg} transition-all duration-300 idea-card`}
      style={{ animationDelay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`${colorScheme.featureAccent} rounded-full p-2 mr-3`}>
            <Lightbulb size={20} className={colorScheme.accentColor} />
          </div>
          <span className="text-xs font-semibold text-slate-300">IDEA {idea.id}</span>
        </div>
      </div>
      
      {/* Title with truncation for long text */}
      <h3
        className={`text-xl font-semibold mb-2 transition-apple ${colorScheme.titleColor} break-words`}
      >
        {idea.title}
      </h3>
      <p className={`${textColor} mb-4 text-sm`}>{idea.description}</p>
      
      <div className={`${colorScheme.featureBg} p-4 rounded-lg mb-6`}>
        <div className="flex items-center mb-2">
          <BrainCircuit size={16} className={`${colorScheme.accentColor} mr-2`} />
          <h4 className="font-medium text-sm text-slate-200">Why We Suggested This</h4>
        </div>
        <p className="text-sm text-slate-300">{idea.rationale}</p>
      </div>
      
      <div className="border-t border-slate-700 pt-4 mt-auto">
        <h4 className="font-medium text-sm mb-3 text-slate-300">Key Features</h4>
        <ul className="space-y-3">
          {idea.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <div className={`${colorScheme.featureAccent} rounded-full p-1 mr-2 mt-0.5`}>
                <span className="block w-4 h-4 rounded-full bg-slate-800/90 text-slate-200 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm text-slate-200">{feature.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="text-slate-300 hover:text-white hover:bg-slate-700/50"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>

        {/* Only show Refine Idea button when onRefine is provided */}
        {onRefine && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefine}
            className="bg-indigo-900/30 border-indigo-500/50 text-indigo-200 hover:bg-indigo-800/50 hover:text-white"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Refine Idea
          </Button>
        )}
      </div>
    </div>
  );
};

export default IdeaCard;
