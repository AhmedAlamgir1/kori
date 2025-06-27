import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ComingSoon: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white flex flex-col">
      <div className="absolute w-full h-full overflow-hidden z-0">
        <div className="stars-container"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mb-8 text-blue-300 hover:text-white hover:bg-blue-900/30"
          onClick={navigateToHome}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

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

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Coming Soon
            </h1>
            <p className="text-xl text-blue-200 mb-10">
              We're working on something amazing for this section. Check back soon!
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ComingSoon;
