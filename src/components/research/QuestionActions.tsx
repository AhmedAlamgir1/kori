import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";

interface QuestionActionsProps {
  onRegenerateQuestions: () => void;
  onCopyToClipboard: () => void;
  questions?: Array<{question: string; explanation: string}>;
  regenerationsLeft?: number;
}

const QuestionActions: React.FC<QuestionActionsProps> = ({
  onRegenerateQuestions,
  onCopyToClipboard,
  questions = [],
  regenerationsLeft = 0
}) => {
  const handleCopy = () => {
    onCopyToClipboard();
    toast.success("Questions copied to clipboard");
  };

  return (
    <div className="flex justify-between">
      <Button 
        onClick={onRegenerateQuestions} 
        variant="outline" 
        className="gap-2"
        disabled={regenerationsLeft <= 0}
      >
        <RefreshCw className="h-4 w-4" /> 
        Generate New Questions
        {regenerationsLeft > 0 && (
          <span className="ml-2 text-xs opacity-70">({regenerationsLeft} left)</span>
        )}
      </Button>

      <Button variant="outline" className="gap-2" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
        Copy All
      </Button>
    </div>
  );
};

export default QuestionActions;
