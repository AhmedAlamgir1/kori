import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Quote, Lightbulb, Network, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatAnalysisProps {
  analysis: Record<string, any> | null;
  isLoading: boolean;
  error: string | null;
}

const ChatAnalysis: React.FC<ChatAnalysisProps> = ({ analysis, isLoading, error }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyAllToClipboard = async () => {
    if (!analysis) return;

    let sections: string[] = [];

    // Key Quotes
    if (analysis.quotes && analysis.quotes.length > 0) {
      sections.push(`Key Quotes:\n${analysis.quotes.map((quote: string) => `"${quote}"`).join('\n')}`);
    }

    // Key Insights
    if (analysis.insights && analysis.insights.length > 0) {
      sections.push(`\nKey Insights:\n${analysis.insights.join('\n')}`);
    }

    // Value Hierarchy
    if (analysis.valueHierarchy && analysis.valueHierarchy.length > 0) {
      sections.push(`\nValue Hierarchy Mapping:\n${analysis.valueHierarchy.join('\n')}`);
    }

    // Pain Points
    if (analysis.painPoints) {
      let painPointsSection = '\nPain Points:';
      if (analysis.painPoints.quotes && analysis.painPoints.quotes.length > 0) {
        painPointsSection += `\nRelevant Quotes:\n${analysis.painPoints.quotes.map((quote: string) => `"${quote}"`).join('\n')}`;
      }
      if (analysis.painPoints.insights && analysis.painPoints.insights.length > 0) {
        painPointsSection += `\nKey Findings:\n${analysis.painPoints.insights.join('\n')}`;
      }
      sections.push(painPointsSection);
    }

    const textToCopy = sections.join('\n');

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.success('All insights copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/60 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Conversation...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-200/80">
            Extracting insights from your research conversation. This may take a moment...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || (analysis && 'error' in analysis)) {
    const errorMessage = error || (analysis?.message || analysis?.error);
    return (
      <Card className="bg-slate-800/60 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-400">{errorMessage}</p>
          <Button 
            variant="outline" 
            className="border-red-500/30 hover:bg-red-500/10"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  if (!analysis.quotes && !analysis.insights && !analysis.valueHierarchy) {
    return (
      <Card className="bg-slate-800/60 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-white">No Clear Insights Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-200/80">
            The conversation didn't contain enough explicit information to generate insights. 
            Try asking more specific questions about values, experiences, or challenges.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/60 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white">Research Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Quotes */}
        {analysis.quotes && analysis.quotes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-200 flex items-center gap-2">
              <Quote className="h-4 w-4" />
              Key Quotes
            </h4>
            <ul className="list-disc list-inside text-blue-100 space-y-1 ml-2">
              {analysis.quotes.map((quote: string, index: number) => (
                <li key={index} className="leading-relaxed italic">
                  "{quote}"
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Key Insights */}
        {analysis.insights && analysis.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-200 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Key Insights
            </h4>
            <ul className="list-disc list-inside text-blue-100 space-y-1 ml-2">
              {analysis.insights.map((insight: string, index: number) => (
                <li key={index} className="leading-relaxed">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Value Hierarchy */}
        {analysis.valueHierarchy && analysis.valueHierarchy.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-200 flex items-center gap-2">
              <Network className="h-4 w-4" />
              Value Hierarchy Mapping
            </h4>
            <ul className="list-disc list-inside text-blue-100 space-y-1 ml-2">
              {analysis.valueHierarchy.map((mapping: string, index: number) => (
                <li key={index} className="leading-relaxed">
                  {mapping}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pain Points */}
        {analysis.painPoints && (
          <div className="space-y-2 border-t border-slate-700 pt-4">
            <h4 className="text-sm font-medium text-blue-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pain Points
            </h4>
            {analysis.painPoints.quotes && analysis.painPoints.quotes.length > 0 && (
              <div className="ml-2 space-y-2">
                <h5 className="text-xs font-medium text-blue-300">Relevant Quotes:</h5>
                <ul className="list-disc list-inside text-blue-100 space-y-1 ml-2">
                  {analysis.painPoints.quotes.map((quote: string, index: number) => (
                    <li key={index} className="leading-relaxed italic">
                      "{quote}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.painPoints.insights && analysis.painPoints.insights.length > 0 && (
              <div className="ml-2 space-y-2">
                <h5 className="text-xs font-medium text-blue-300">Key Findings:</h5>
                <ul className="list-disc list-inside text-blue-100 space-y-1 ml-2">
                  {analysis.painPoints.insights.map((insight: string, index: number) => (
                    <li key={index} className="leading-relaxed">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Copy All Button */}
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            className="bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-white flex items-center gap-2"
            onClick={copyAllToClipboard}
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy All Insights</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatAnalysis; 