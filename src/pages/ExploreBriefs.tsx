import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InnovationSpaceCards from "@/components/briefs/InnovationSpaceCards";
import SpaceDetailView from "@/components/briefs/SpaceDetailView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ExploreBriefs: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const navigateToHome = () => {
    setPendingAction(() => () => {
      navigate("/");
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white">
      <div className="absolute w-full h-full overflow-hidden z-0">
        <div className="stars-container"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 text-blue-300 hover:text-white hover:bg-blue-900/30"
            onClick={navigateToHome}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Explore Innovation Briefs</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-indigo-500/30"
        >
          <p className="text-blue-200 text-lg mb-4">
            Discover impactful areas where innovation can make a difference. Each brief explores challenges and opportunities in different spaces of life and society.
          </p>
          <p className="text-blue-300/80">
            Select a space below to explore potential innovation opportunities and get inspired for your next project.
          </p>
        </motion.div>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Leave this section?</DialogTitle>
              <DialogDescription className="text-slate-400">
                Make sure you have saved your work before leaving. Any unsaved changes will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                className="bg-red-900 hover:bg-red-800"
              >
                Proceed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {selectedSpace ? (
          <SpaceDetailView 
            spaceName={selectedSpace} 
            onBack={() => setSelectedSpace(null)} 
          />
        ) : (
          <Tabs defaultValue="featured" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-slate-800/60 border border-indigo-500/30">
                <TabsTrigger value="featured" className="text-sm data-[state=active]:bg-indigo-600">
                  Featured Spaces
                </TabsTrigger>
                <TabsTrigger value="sdgs" className="text-sm data-[state=active]:bg-indigo-600">
                  UN SDGs
                </TabsTrigger>
                <TabsTrigger value="emerging" className="text-sm data-[state=active]:bg-indigo-600">
                  Emerging Technologies
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="featured" className="mt-0">
              <InnovationSpaceCards 
                category="featured" 
                onSelectSpace={setSelectedSpace} 
              />
            </TabsContent>
            
            <TabsContent value="sdgs" className="mt-0">
              <InnovationSpaceCards 
                category="sdgs" 
                onSelectSpace={setSelectedSpace} 
              />
            </TabsContent>
            
            <TabsContent value="emerging" className="mt-0">
              <InnovationSpaceCards 
                category="emerging" 
                onSelectSpace={setSelectedSpace} 
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ExploreBriefs;
