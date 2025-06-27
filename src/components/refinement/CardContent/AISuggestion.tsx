import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp, Copy } from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimation";
import { toast } from "sonner";
import { PromptCard } from "../types";

interface AISuggestionProps {
  suggestion: string;
  example: string;
  isGenerating: boolean;
  onGetSuggestion: () => void;
  textAccentColor: string;
  card: PromptCard;
}

const AISuggestion: React.FC<AISuggestionProps> = ({
  suggestion,
  example,
  isGenerating,
  onGetSuggestion,
  textAccentColor,
  card,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (!suggestion && !isGenerating) {
      onGetSuggestion();
    }
    setIsVisible(!isVisible);
  };

  const handleCopy = () => {
    try {
      // Debug log to check values
      console.log('Copying card content:', {
        question: card?.question,
        answer: card?.answer,
        suggestion,
        example
      });

      // Check if we have the required data
      if (!card?.question) {
        console.error('Missing card question');
        toast.error("Cannot copy: Missing card content");
        return;
      }

      const cardContent = `Question: ${card.question}\n\nYour Answer: ${card.answer || "No answer yet"}\n\nAI Suggestion: ${suggestion || "No suggestion yet"}${example ? `\n\nExample: ${example}` : ""}`;
      
      // Debug log the content being copied
      console.log('Content to copy:', cardContent);

      // Use the newer clipboard API
      navigator.clipboard.writeText(cardContent)
        .then(() => {
          toast.success("Card content copied to clipboard!");
        })
        .catch((err) => {
          console.error('Clipboard API failed:', err);
          // Fallback to execCommand
          const textArea = document.createElement('textarea');
          textArea.value = cardContent;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            const successful = document.execCommand('copy');
            if (successful) {
              toast.success("Card content copied to clipboard!");
            } else {
              throw new Error('execCommand copy failed');
            }
          } catch (execErr) {
            console.error('execCommand failed:', execErr);
            toast.error("Failed to copy to clipboard. Please try again.");
          } finally {
            document.body.removeChild(textArea);
          }
        });
    } catch (error) {
      console.error('Copy operation failed:', error);
      toast.error("Failed to copy to clipboard. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className={`${textAccentColor} border-current hover:bg-slate-800/50`}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Card
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleVisibility}
          className={`${textAccentColor} border-current hover:bg-slate-800/50 flex items-center`}
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {suggestion ? (
            <>
              AI Suggestion
              {isVisible ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </>
          ) : (
            "Get AI Suggestion"
          )}
        </Button>
      </div>

      {isGenerating && (
        <div className="flex items-center justify-center py-4">
          <LoadingAnimation message="Generating suggestion..." />
        </div>
      )}

      {suggestion && isVisible && !isGenerating && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-slate-200">{suggestion}</p>
          {example && (
            <>
              <h5 className={`text-sm font-medium ${textAccentColor}`}>Example</h5>
              <p className="text-slate-300">{example}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AISuggestion;
