import React, { useState } from "react";
import { ProblemStatement } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquare } from "lucide-react";
import ProblemStatementTabs from "./innovation/ProblemStatementTabs";
interface ProblemStatementInputProps {
  onSubmit: (problemStatement: ProblemStatement, mode: "generate" | "refine") => void;
  isLoading: boolean;
}
const ProblemStatementInput: React.FC<ProblemStatementInputProps> = ({
  onSubmit,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<"generate" | "refine">("generate");
  const handleTabChange = (value: "generate" | "refine") => {
    setActiveTab(value);
  };
  return <Card className="w-full bg-slate-800/50 backdrop-blur-sm border border-indigo-500/30">
      
      <CardContent className="py-[24px] px-[24px]">
        <ProblemStatementTabs activeTab={activeTab} onTabChange={handleTabChange} onSubmit={onSubmit} isLoading={isLoading} />
      </CardContent>
    </Card>;
};
export default ProblemStatementInput;