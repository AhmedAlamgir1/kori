import React from "react";
import { CheckCircle, MessageCircle } from "lucide-react";
import { ValidationFeedback } from "./types";

interface ValidationFeedbackProps {
  feedback: ValidationFeedback;
}

const ValidationFeedbackDisplay: React.FC<ValidationFeedbackProps> = ({ feedback }) => {
  if (!feedback) return null;

  const { isValid, message } = feedback;
  
  const getBgColor = () => {
    if (isValid) return 'bg-green-500/20 border border-green-500/30';
    return 'bg-indigo-500/20 border border-indigo-500/30';
  };

  return (
    <div className={`p-4 rounded-md mt-4 ${getBgColor()}`}>
      <div className="flex items-start gap-3">
        {isValid ? (
          <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
        ) : (
          <MessageCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-sm whitespace-pre-line text-white">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ValidationFeedbackDisplay;
