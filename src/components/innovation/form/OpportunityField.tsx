import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface OpportunityFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  showError: boolean;
  disabled: boolean;
}

const OpportunityField: React.FC<OpportunityFieldProps> = ({
  value,
  onChange,
  onBlur,
  showError,
  disabled
}) => {
  const minWords = 3;
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const isUnderMinWords = wordCount > 0 && wordCount < minWords;

  return (
    <div className="space-y-1.5">
      <Label htmlFor="opportunity" className="text-sm text-white">
        Opportunity Area <span className="text-white">*</span>
      </Label>
      <Input
        id="opportunity"
        placeholder="What area of opportunity are you exploring? (e.g., Sustainable transportation, Remote education, etc.)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={`${showError || isUnderMinWords ? 'border-indigo-500' : 'border-indigo-500/30'} bg-slate-800/60 text-sm text-white placeholder:text-white/50 focus:border-indigo-400`}
      />
      <div className="flex justify-end text-xs">
        <div className={`${wordCount < minWords ? 'text-white' : 'text-white/70'}`}>
          {wordCount}/{minWords} words required
        </div>
      </div>
    </div>
  );
};

export default OpportunityField;
