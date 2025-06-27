
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FeaturesFieldProps {
  features: string[];
  onChange: (index: number, value: string) => void;
  onBlur: (index: number) => void;
  showError: boolean;
  touched: boolean[];
  disabled: boolean;
}

const FeaturesField: React.FC<FeaturesFieldProps> = ({
  features,
  onChange,
  onBlur,
  showError,
  touched,
  disabled
}) => {
  return (
    <div>
      <Label 
        className="block text-sm font-medium mb-1.5 text-blue-200"
      >
        Key Features (at least 1 required)
      </Label>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index}>
            <Textarea
              value={feature}
              onChange={(e) => onChange(index, e.target.value)}
              onBlur={() => onBlur(index)}
              placeholder={`Feature ${index + 1}${index === 0 ? ' (required)' : ' (optional)'}`}
              className={`w-full px-4 py-3 rounded-lg bg-white/10 text-white border ${
                touched[index] && !feature.trim() && index === 0
                  ? 'border-destructive focus:ring-destructive/20' 
                  : 'border-indigo-500/30 focus:border-blue-400'
              } transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
              disabled={disabled}
              rows={2}
            />
          </div>
        ))}
      </div>
      {showError && (
        <p className="mt-1.5 text-sm text-destructive">Please enter at least one feature</p>
      )}
    </div>
  );
};

export default FeaturesField;
