
import React from "react";
import { Loader2 } from "lucide-react";
import { Message } from "./ChatInterface";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const getTimeString = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-xl p-3 ${
              msg.sender === "user"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-blue-100"
            }`}
          >
            <p>{msg.content}</p>
            <span className="text-xs opacity-70 block text-right mt-1">
              {getTimeString(msg.timestamp)}
            </span>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-xl p-3 bg-slate-700 text-blue-100">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
