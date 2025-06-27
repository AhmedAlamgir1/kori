import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

interface SuggestionBoxProps {
  originalQuestion: string;
  suggestedQuestion: string;
  feedback?: string; // Feedback prop
  onAccept: () => void;
  onReject: () => void;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({
  originalQuestion,
  suggestedQuestion,
  feedback,
  onAccept,
  onReject
}) => {
  return (
    <Card className="bg-indigo-900/30 border-indigo-500/40 p-4 my-4">
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-blue-300">Your Question:</h4>
          <p className="text-white/80">{originalQuestion}</p>
          
          {feedback && (
            <div className="mt-2 text-sm text-blue-300/90 bg-slate-800/50 p-2 rounded border border-blue-500/20">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{feedback}</p>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-green-300">Suggested Improvement:</h4>
          <p className="text-white font-medium">{suggestedQuestion}</p>
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-red-950/30 hover:bg-red-900/40" 
            onClick={onReject}
          >
            <ThumbsDown className="h-4 w-4 mr-1" /> Keep Mine
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-green-950/30 hover:bg-green-900/40" 
            onClick={onAccept}
          >
            <ThumbsUp className="h-4 w-4 mr-1" /> Use Suggestion
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SuggestionBox;
