export interface Message {
  id: string;
  role: "user" | "chatgpt";
  content: string;
}

export interface ChatAnalysis {
  insights: string[];
  recommendations: string[];
  summary: string;
} 