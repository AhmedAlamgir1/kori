import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";

interface ProfileActionsProps {
  onRefresh: () => void;
  onAddCustom: () => void;
  regenerationsLeft?: number;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ 
  onRefresh, 
  onAddCustom,
  regenerationsLeft = 0
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      <Button
        onClick={onRefresh}
        className="bg-blue-600 text-white hover:bg-blue-700"
        size="sm"
        disabled={regenerationsLeft <= 0}
      >
        <RefreshCw className="mr-2 h-4 w-4" /> 
        Generate New Profiles
        {regenerationsLeft > 0 && (
          <span className="ml-2 text-xs opacity-70">({regenerationsLeft} left)</span>
        )}
      </Button>
      
      <Button
        onClick={onAddCustom}
        variant="outline"
        size="sm"
      >
        <UserPlus className="mr-2 h-4 w-4" /> Add Custom Profile
      </Button>
    </div>
  );
};

export default ProfileActions;
