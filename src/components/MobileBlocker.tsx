import React from "react";
import { motion } from "framer-motion";
import { Laptop2, ArrowRight } from "lucide-react";

const MobileBlocker: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-indigo-900 flex items-center justify-center z-50 p-4">
      <div className="absolute w-full h-full overflow-hidden">
        <div className="stars-container"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-indigo-500/30 w-full max-w-md mx-4 text-center"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center">
            <Laptop2 className="w-8 h-8 text-indigo-400" />
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Enhanced Desktop Experience</h2>
              <p className="text-blue-200/80 text-center max-w-md mx-auto">
                Kori offers a powerful set of innovation tools that are optimized for desktop use. Switch to a desktop or laptop computer to unlock the full potential.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileBlocker; 