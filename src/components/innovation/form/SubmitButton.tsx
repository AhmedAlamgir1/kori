
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
  isValidating: boolean;
  isValid: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  isValidating,
  isValid
}) => {
  return (
    <Button
      type="submit"
      disabled={isLoading || isValidating || !isValid}
      className={`w-full flex items-center justify-center space-x-2 px-6 py-6 rounded-lg font-medium transition-all ${
        isLoading || isValidating || !isValid
          ? 'bg-indigo-600/40 text-white/80 cursor-not-allowed'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {isLoading || isValidating ? (
        <>
          <span>{isValidating ? "Validating..." : "Submitting..."}</span>
        </>
      ) : (
        <>
          <span>Refine Idea</span>
          <ArrowRight size={16} />
        </>
      )}
    </Button>
  );
};

export default SubmitButton;
