import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { PromptCard } from './types';

interface RefinementNotesProps {
  cards: PromptCard[];
}

const RefinementNotes: React.FC<RefinementNotesProps> = ({ cards }) => {
  const refinements = cards.filter(card => card.answer.trim() !== '');

  const copyNotes = () => {
    const formattedNotes = refinements
      .map((card, index) => `${index + 1}. Question: ${card.question}\nAnswer: ${card.answer}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(formattedNotes);
    toast.success("Refinements copied to clipboard!");
  };

  return (
    <div className="mt-8 p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-indigo-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-blue-300">My Refinements</h3>
        {refinements.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={copyNotes}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Notes list */}
        <div className="space-y-3">
          {refinements.map((card, index) => (
            <div
              key={card.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/50"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm">
                {index + 1}
              </span>
              <div className="flex-grow space-y-2">
                <p className="text-blue-300/80 text-sm">{card.question}</p>
                <p className="text-slate-200">{card.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Counter */}
        <div className="text-sm text-slate-400 text-right">
          {refinements.length} refinement{refinements.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default RefinementNotes; 