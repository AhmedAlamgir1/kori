import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, AlertCircle, Check, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const correctPasscode = "2025";
  const maxAttempts = 3;
  const lockoutDuration = 30; // seconds

  useEffect(() => {
    // Check if user is in lockout
    const lockedUntil = localStorage.getItem("kori_lockout");
    if (lockedUntil) {
      const timeLeft = Math.ceil((parseInt(lockedUntil) - Date.now()) / 1000);
      if (timeLeft > 0) {
        setIsLocked(true);
        setLockoutTime(timeLeft);
      } else {
        localStorage.removeItem("kori_lockout");
      }
    }

    // Load previous attempts
    const savedAttempts = localStorage.getItem("kori_attempts");
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  useEffect(() => {
    let timer: number;
    if (isLocked && lockoutTime > 0) {
      timer = window.setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            localStorage.removeItem("kori_lockout");
            localStorage.removeItem("kori_attempts");
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  const handleNumberClick = (number: string) => {
    if (!isLocked && passcode.length < 4) {
      setPasscode(prev => prev + number);
    }
  };

  const handleDelete = () => {
    if (!isLocked) {
      setPasscode(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (isLocked) return;

    if (passcode === correctPasscode) {
      onUnlock();
      toast.success("Welcome to Kori");
      // Reset attempts on successful login
      localStorage.removeItem("kori_attempts");
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("kori_attempts", newAttempts.toString());
      
      if (newAttempts >= maxAttempts) {
        setIsLocked(true);
        setLockoutTime(lockoutDuration);
        const lockoutUntil = Date.now() + (lockoutDuration * 1000);
        localStorage.setItem("kori_lockout", lockoutUntil.toString());
        toast.error(`Too many failed attempts. Please try again in ${lockoutDuration} seconds.`);
      } else {
        toast.error(`Incorrect passcode. ${maxAttempts - newAttempts} attempts remaining.`);
      }
      setPasscode("");
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isLocked) return;

    if (event.key >= "0" && event.key <= "9" && passcode.length < 4) {
      handleNumberClick(event.key);
    } else if (event.key === "Backspace" || event.key === "Delete") {
      handleDelete();
    } else if (event.key === "Enter" && passcode.length === 4) {
      handleSubmit();
    }
  }, [isLocked, passcode]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const renderNumberButton = (number: string) => (
    <Button
      key={number}
      variant="outline"
      className="w-16 h-16 text-2xl rounded-full bg-slate-800/50 border-indigo-500/30 text-white hover:bg-indigo-600/20 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => handleNumberClick(number)}
      disabled={isLocked}
    >
      {number}
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="absolute w-full h-full overflow-hidden">
        <div className="stars-container"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-indigo-500/30 w-full max-w-md mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isLocked ? 'bg-red-600/20' : 'bg-indigo-600/20'
          }`}>
            <Lock className={`w-8 h-8 ${
              isLocked ? 'text-red-400' : 'text-indigo-400'
            }`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Enter Passcode</h2>
          <p className="text-blue-200/80 text-center">Please enter the passcode to access Kori</p>
          
          {isLocked && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>Try again in {lockoutTime} seconds</span>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex justify-center gap-4 mb-4">
            {Array(4).fill(0).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-colors ${
                  i < passcode.length
                    ? isLocked ? 'bg-red-500' : 'bg-indigo-500'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 place-items-center w-fit mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(renderNumberButton)}
          <Button
            variant="outline"
            className="w-16 h-16 rounded-full bg-slate-800/50 border-indigo-500/30 text-white hover:bg-red-600/20 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleDelete}
            disabled={isLocked}
          >
            <Delete className="w-6 h-6" />
          </Button>
          {renderNumberButton("0")}
          <Button
            variant="outline"
            className={`w-16 h-16 rounded-full bg-slate-800/50 border-indigo-500/30 text-white flex items-center justify-center
              ${isLocked 
                ? 'hover:bg-red-600/20 hover:border-red-400' 
                : 'hover:bg-green-600/20 hover:border-green-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={handleSubmit}
            disabled={isLocked || passcode.length !== 4}
          >
            <Check className="w-6 h-6" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LockScreen; 