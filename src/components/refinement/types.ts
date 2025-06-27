export interface PromptCard {
  id: number;
  question: string;
  example: string;
  answer: string;
  prompt: string;
  deckType?: 'scamper' | 'whatif' | 'kaizen';
}
