import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface SimpleQuestionInputProps {
  customQuestion: string;
  setCustomQuestion: (value: string) => void;
  validating: boolean;
  onSubmit: () => void;
}

const SimpleQuestionInput: React.FC<SimpleQuestionInputProps> = ({
  customQuestion,
  setCustomQuestion,
  validating,
  onSubmit
}) => {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          placeholder="Add your own question..."
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          className="bg-slate-700/50"
          disabled={validating}
        />
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSubmit} 
        disabled={validating || !customQuestion.trim()}
        className="text-white hover:text-white"
      >
        <Plus className="h-4 w-4 mr-1" /> Next
      </Button>
    </div>
  );
};

export default SimpleQuestionInput;
