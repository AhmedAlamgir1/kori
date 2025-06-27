
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";

interface HeaderControlsProps {
  onBack: () => void;
  onRegenerate: () => void;
  onSave?: () => void;
  isGenerating: boolean;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({ 
  onBack, 
  onRegenerate, 
  onSave,
  isGenerating 
}) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-300 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-white">Product Builder</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          {onSave && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSave}
              disabled={isGenerating}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderControls;
