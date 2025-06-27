export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatAnalysis {
  insights: string[];
  recommendations: string[];
  summary: string;
} 