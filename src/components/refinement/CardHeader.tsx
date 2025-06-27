
import React from 'react';
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

interface CardHeaderProps {
  title: string;
  icon: React.ReactNode;
  currentCardIndex: number;
  totalCards: number;
  onShuffleDeck: () => void;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  icon,
  currentCardIndex,
  totalCards,
  onShuffleDeck
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-medium text-blue-200">{title} ({currentCardIndex + 1}/{totalCards})</h3>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onShuffleDeck}
        className="text-slate-300 hover:bg-slate-700/50"
      >
        <Shuffle className="h-4 w-4 mr-1" /> Shuffle
      </Button>
    </div>
  );
};

export default CardHeader;
