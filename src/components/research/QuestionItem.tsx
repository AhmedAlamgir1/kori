import React from "react";
import { Button } from "@/components/ui/button";
import { X, Info, MessageCircle, GripVertical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface QuestionItemProps {
  question: string;
  explanation: string;
  index: number;
  onRemove: (index: number) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  feedback?: string; // Optional AI feedback for custom questions
  category?: string; // Added category prop for color coding
}

// Define section color mapping
const getCategoryColor = (category: string): string => {
  switch (category) {
    case "Introduction":
      return "bg-blue-600";
    case "General Experience":
      return "bg-green-600";
    case "Pain Points":
      return "bg-amber-600";
    case "Existing Solutions":
      return "bg-purple-600";
    case "Your Questions":
      return "bg-rose-600";
    default:
      return "bg-indigo-600";
  }
};

// Define section background color mapping (more subtle)
const getCategoryBgColor = (category: string): string => {
  switch (category) {
    case "Introduction":
      return "bg-blue-700/30";
    case "General Experience":
      return "bg-green-700/30";
    case "Pain Points":
      return "bg-amber-700/30";
    case "Existing Solutions":
      return "bg-purple-700/30";
    case "Your Questions":
      return "bg-rose-700/30";
    default:
      return "bg-slate-700/50";
  }
};

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  explanation,
  index,
  onRemove,
  isDragging = false,
  dragHandleProps,
  feedback,
  category = "Default"
}) => {
  const categoryColor = getCategoryColor(category);
  const categoryBgColor = getCategoryBgColor(category);
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-md group transition-all duration-200",
      categoryBgColor,
      isDragging && "shadow-xl ring-2 ring-indigo-600/80 opacity-90 scale-[1.02]"
    )}>
      <div 
        {...dragHandleProps} 
        className="flex-shrink-0 cursor-grab text-blue-300/70 hover:text-blue-300 transition-colors active:cursor-grabbing"
      >
        <GripVertical className="h-6 w-6" />
      </div>
      <div className={cn("min-w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium", categoryColor)}>
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-blue-100 flex-1">{question}</p>
          <div className="flex-shrink-0">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 bg-slate-600/40">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="left" 
                  align="center" 
                  className="max-w-xs md:max-w-sm bg-slate-900 border-indigo-500/50 text-blue-100"
                  sideOffset={5}
                >
                  <div className="space-y-2">
                    <p className="text-sm">{explanation}</p>
                    {feedback && (
                      <div className="pt-2 border-t border-slate-700">
                        <div className="flex items-start gap-2 text-sm text-blue-300">
                          <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>{feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuestionItem;
