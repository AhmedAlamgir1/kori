import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageCircle, Copy, ArrowLeft, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useChatStore } from "@/stores/useChatStore";
import useProfileStore from "@/stores/useProfileStore";
import { getChatMessages } from "@/utils/api/chatApi";
import profilepic from '../assets/profile-pic.jpeg';

interface Message {
  _id: string;
  role: "user" | "assistant" | "system" | "chatgpt";
  content: string;
  timestamp: string;
}

const SavedMockInterview = () => {
  const navigate = useNavigate();
  const { chats } = useChatStore();
  const { selectedProfile } = useProfileStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);

  useEffect(() => {
    if (chats && selectedProfile) {
      // Find the chat that matches the selected profile
      for (const chat of chats) {
        const matchingPrompt = chat.prompts?.find(prompt => {
          const promptAge = Number(prompt.profile?.age);
          const profileAge = Number(selectedProfile.age);
          
          return prompt.profile?.name === selectedProfile.name &&
                 promptAge === profileAge &&
                 prompt.profile?.occupation === selectedProfile.occupation;
        });

        if (matchingPrompt) {
          setCurrentChatId(chat._id);
          setCurrentPromptId(matchingPrompt._id);
          fetchChatMessages(chat._id, matchingPrompt._id);
          break;
        }
      }
    }
  }, [chats, selectedProfile]);

  const fetchChatMessages = async (chatId: string, promptId: string) => {
    try {
      setIsLoading(true);
      const data = await getChatMessages(chatId, promptId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copyToClipboard = () => {
    const text = messages
      .filter(m => m.role !== "system")
      .map(m => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success("Chat history copied to clipboard!");
  };

  const handleBack = () => {
    navigate('/prompts');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-blue-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prompts
          </Button>
        </div>

        <Card className="bg-slate-800/60 border-indigo-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageCircle className="h-5 w-5" />
              Mock Interview History
              {selectedProfile && (
                <span className="text-sm bg-indigo-500/30 border border-indigo-500/30 text-white px-2 py-1 ml-2 rounded-md">
                  with {selectedProfile.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedProfile && (
              <div className="flex justify-between">
                <div className="profile-pic" style={{width: '20%'}}>
                  {selectedProfile.imageLoading ? (
                    <div className="rounded-sm bg-slate-700 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                    </div>
                  ) : selectedProfile.image ? (
                    <img 
                      src={selectedProfile.image} 
                      alt="persona pic" 
                      className="rounded-sm object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = profilepic;
                      }}
                    />
                  ) : (
                    <div className="rounded-sm bg-slate-700 flex items-center justify-center">
                      <UserRound className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="text-blue-200/80 space-y-4 text-base border-b border-slate-700 pb-4" style={{width: '79%'}}>
                  <p className="text-white text-base">
                    Respondent: {selectedProfile.name}
                    <span className="mx-2">•</span>
                    {selectedProfile.age} years old
                    <span className="mx-2">•</span>
                    {selectedProfile.occupation}
                  </p>
                  <div>
                    <span className="text-white font-medium">Background: </span>
                    <span>{selectedProfile.background}</span>
                  </div>
                  <div>
                    <span className="text-white font-medium">Unique Perspective: </span>
                    <span>{selectedProfile.perspective}</span>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
                <p className="text-blue-200 mt-4">Loading chat history...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.filter(m => m.role !== "system").map((message) => (
                  <div 
                    key={message._id}
                    className={`flex flex-col ${
                      message.role === "chatgpt" ? "items-start" : "items-end"
                    }`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "chatgpt" 
                          ? "bg-slate-700/50 text-blue-100/90" 
                          : "bg-indigo-600/40 text-white"
                      }`}
                    >
                      <div className="text-sm text-blue-200/60 mb-1">
                        {message.role === "chatgpt" ? "AI Assistant" : "You"}
                        <span className="mx-2">•</span>
                        {formatTimestamp(message.timestamp)}
                      </div>
                      <div>{message.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-xl font-bold text-white mb-2">No chat history found</h2>
                <p className="text-blue-200/80">Start a mock interview to see the conversation here.</p>
              </div>
            )}
          </CardContent>
          {messages.length > 0 && (
            <CardFooter className="flex gap-2 pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-white hover:text-white border-blue-500/30 hover:bg-blue-600/30"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Chat History
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SavedMockInterview; 