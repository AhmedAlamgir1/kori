import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { PromptCard } from "../types";

interface CardAnswerProps {
  card: PromptCard;
  textAccentColor: string;
  onAnswerChange: (value: string) => void;
}

const CardAnswer: React.FC<CardAnswerProps> = ({
  card,
  textAccentColor,
  onAnswerChange,
}) => {
  return (
    <div className="space-y-2">
      <h4 className={`text-sm font-medium ${textAccentColor}`}>Your Answer</h4>
      <Textarea
        value={card.answer || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        className="min-h-[100px] bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 resize-none"
      />
    </div>
  );
};

export default CardAnswer;
