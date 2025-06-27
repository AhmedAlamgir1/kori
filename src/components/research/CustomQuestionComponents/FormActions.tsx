import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  validating: boolean;
  isValid: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  validating,
  isValid
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCancel}
        className="text-white hover:text-white"
      >
        Cancel
      </Button>
      <Button 
        variant="outline"
        size="sm" 
        onClick={onSubmit} 
        disabled={validating || !isValid}
        className="text-white hover:text-white"
      >
        {validating ? (
          <>
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Validating
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-1" /> Add Question
          </>
        )}
      </Button>
    </div>
  );
};

export default FormActions;
