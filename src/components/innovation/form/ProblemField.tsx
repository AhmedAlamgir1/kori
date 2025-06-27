import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProblemFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  wordCount: number;
  showEmptyError: boolean;
  disabled: boolean;
}

const ProblemField: React.FC<ProblemFieldProps> = ({
  value,
  onChange,
  onBlur,
  wordCount,
  showEmptyError,
  disabled
}) => {
  const minWords = 20;
  const isUnderMinWords = wordCount > 0 && wordCount < minWords;

  return (
    <div className="space-y-1.5">
      <Label htmlFor="problem" className="text-sm text-white">
        Problem Statement <span className="text-white">*</span>
      </Label>
      <Textarea
        id="problem"
        placeholder="Describe the specific problem or challenge you want to solve..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={`h-24 resize-none bg-slate-800/60 text-sm text-white placeholder:text-white/50 ${showEmptyError || isUnderMinWords ? 'border-indigo-500' : 'border-indigo-500/30'} focus:border-indigo-400`}
      />
      <div className="flex justify-end text-xs">
        <div className={`${wordCount < minWords ? 'text-white' : 'text-white/70'}`}>
          {wordCount}/{minWords} words required
        </div>
      </div>
    </div>
  );
};

export default ProblemField;
