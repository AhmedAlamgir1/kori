import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, SendHorizonal, BarChart2 } from "lucide-react";
import { RespondentProfile } from "./profile/types";
import MessageList from "./MessageList";
import ChatAnalysis from "./ChatAnalysis";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  respondentProfile: RespondentProfile;
  onSendMessage: (e: React.FormEvent) => void;
  onReset: () => void;
  questionCount: number;
  isChatEnded: boolean;
  analysis: Record<string, any> | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  onAnalyze: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  respondentProfile,
  onSendMessage,
  onReset,
  questionCount,
  isChatEnded,
  analysis,
  isAnalyzing,
  analysisError,
  onAnalyze
}) => {
  // Check if we have a complete profile (one that was selected by the user)
  // or just a placeholder profile
  const hasCompleteProfile = respondentProfile.age && respondentProfile.occupation;
  const showAnalyzeButton = questionCount >= 7 && !isChatEnded;

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/60 border-indigo-500/30 flex flex-col h-[600px]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="h-5 w-5" />
                {hasCompleteProfile ? (
                  <>Chat with {respondentProfile.name}</>
                ) : (
                  <>Synthetic Chat</>
                )}
              </CardTitle>
              <div className="text-sm text-blue-300">
                Questions asked: {questionCount}/7
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reset
            </Button>
          </div>
          {hasCompleteProfile && (
            <div className="text-sm text-blue-300">
              {respondentProfile.age} • {respondentProfile.occupation}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto mb-4 pr-2">
          <MessageList messages={messages} isLoading={isLoading} />
        </CardContent>
        
        <CardFooter className="pt-4 border-t border-slate-700">
          <form onSubmit={onSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Type your interview question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading || isChatEnded}
              className="flex-grow"
            />
            {showAnalyzeButton ? (
              <Button 
                type="button" 
                onClick={onAnalyze}
                disabled={isAnalyzing}
                variant="secondary"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                End Chat & Analyze
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isLoading || isChatEnded || !inputMessage.trim()}
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            )}
          </form>
        </CardFooter>
      </Card>

      {(isAnalyzing || analysis || analysisError) && (
        <ChatAnalysis 
          analysis={analysis}
          isLoading={isAnalyzing}
          error={analysisError}
        />
      )}
    </div>
  );
};

export default ChatInterface;
