
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IdeaTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  showError: boolean;
  disabled: boolean;
}

const IdeaTitleField: React.FC<IdeaTitleFieldProps> = ({
  value,
  onChange,
  onBlur,
  showError,
  disabled
}) => {
  return (
    <div>
      <Label 
        htmlFor="idea-title" 
        className="block text-sm font-medium mb-1.5 text-blue-200"
      >
        Main Idea Title
      </Label>
      <Input
        id="idea-title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="Enter the title of your idea"
        className={`w-full px-4 py-3 rounded-lg bg-white/10 text-white border ${
          showError 
            ? 'border-destructive focus:ring-destructive/20' 
            : 'border-indigo-500/30 focus:border-blue-400'
        } transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
        disabled={disabled}
      />
      {showError && (
        <p className="mt-1.5 text-sm text-destructive">Please enter the idea title</p>
      )}
    </div>
  );
};

export default IdeaTitleField;
