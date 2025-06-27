import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CardNavigationProps {
  currentCardIndex: number;
  totalCards: number;
  accentColor: string;
  onPrevCard: () => void;
  onNextCard: () => void;
}

const CardNavigation: React.FC<CardNavigationProps> = ({
  currentCardIndex,
  totalCards,
  accentColor,
  onPrevCard,
  onNextCard
}) => {
  const getButtonClass = () => {
    switch(accentColor) {
      case 'purple': 
      case 'scamper':
        return 'bg-purple-900/60 border-purple-700/70';
      case 'blue': 
      case 'whatif':
        return 'bg-blue-900/60 border-blue-700/70';
      case 'amber': 
      case 'kaizen':
        return 'bg-amber-900/60 border-amber-700/70';
      default:
        return 'bg-indigo-900/60 border-indigo-700/70';
    }
  };
  
  return (
    <div className="flex justify-between pt-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onPrevCard}
        disabled={currentCardIndex === 0}
        className="bg-slate-800/60 border-slate-700 text-slate-300"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onNextCard}
        className={`${getButtonClass()} text-white`}
      >
        {currentCardIndex === totalCards - 1 ? (
          <>Next<ChevronRight className="h-4 w-4 ml-1" /></>
        ) : (
          <>Next<ChevronRight className="h-4 w-4 ml-1" /></>
        )}
      </Button>
    </div>
  );
};

export default CardNavigation;
