
import React from "react";
import { Monitor } from "lucide-react";

interface CodePreviewProps {
  content: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ content }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-800 p-2 border-b border-gray-700 flex items-center">
        <Monitor className="mr-2 h-4 w-4 text-gray-300" />
        <h2 className="text-sm font-medium text-gray-300">Preview</h2>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        {content ? (
          <iframe
            title="Code Preview"
            srcDoc={content}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
            <p>Click "Run Code" to see the preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePreview;
