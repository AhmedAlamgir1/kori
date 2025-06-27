export interface QuestionWithExplanation {
  question: string;
  explanation: string;
  category?: string | null;
  feedback?: string | null;
  suggestedQuestion?: string; // Add suggested question field
}

export interface InterviewQuestionContextType {
  questionsWithExplanations: QuestionWithExplanation[];
  loading: boolean;
  error: string | null;
  draggedItem: number | null;
  fetchQuestions: (isProfileChange?: boolean) => void;
  addCustomQuestion: (question: QuestionWithExplanation) => void;
  removeQuestion: (index: number) => void;
  handleDragStart: (index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, overIndex: number) => void;
  handleDragEnd: () => void;
  getQuestionCategory: (index: number) => string;
  opportunity: string; // Add opportunity to the context type
  selectedProfile: any | null; // Add selected profile
  regenerationsLeft: number;
}

// Define the return type for the generateInterviewQuestions function
export interface InterviewQuestionsResponse {
  questions: string[];
  explanations: string[];
  categories?: string[];
}
