
import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";

interface DeckTabTriggerProps {
  value: string;
  icon: React.ReactElement;
  label: string;
  isSaved: boolean;
}

const DeckTabTrigger: React.FC<DeckTabTriggerProps> = ({
  value,
  icon,
  label,
  isSaved
}) => {
  // Determine background color based on value
  const getBgColor = () => {
    switch(value) {
      case 'scamper': return 'data-[state=active]:bg-purple-800/60';
      case 'whatif': return 'data-[state=active]:bg-blue-800/60';
      case 'kaizen': return 'data-[state=active]:bg-amber-800/60';
      default: return 'data-[state=active]:bg-indigo-800/60';
    }
  };

  return (
    <TabsTrigger 
      value={value}
      className={`${getBgColor()} data-[state=active]:text-white relative`}
    >
      <div className="flex items-center">
        <span className="mr-2">
          {React.cloneElement(icon, { size: 20 })}
        </span>
        <span>{label}</span>
        {isSaved && (
          <span className="absolute top-0 right-1 text-xs">✓</span>
        )}
      </div>
    </TabsTrigger>
  );
};

export default DeckTabTrigger;
