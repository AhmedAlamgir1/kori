
import React from "react";
import { Code } from "lucide-react";

interface CodeConsoleProps {
  content: string;
  isGenerating: boolean;
}

const CodeConsole: React.FC<CodeConsoleProps> = ({ content, isGenerating }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-800 p-2 border-b border-gray-700 flex items-center">
        <Code className="mr-2 h-4 w-4 text-gray-300" />
        <h2 className="text-sm font-medium text-gray-300">Console</h2>
      </div>
      <div className="flex-1 overflow-auto bg-gray-900 p-4">
        <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
          {isGenerating ? "Generating code..." : content || "// Code will appear here"}
        </pre>
      </div>
    </div>
  );
};

export default CodeConsole;
