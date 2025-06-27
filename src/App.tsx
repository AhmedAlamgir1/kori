import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import Understand from "./pages/Understand";
import LockScreen from "./components/LockScreen";
import MobileBlocker from "./components/MobileBlocker";
import { useIsMobile } from "./hooks/useIsMobile";

const queryClient = new QueryClient();

const App = () => {
  const [isLocked, setIsLocked] = useState(true);
  const isMobile = useIsMobile();

  // Check if the app has been unlocked before
  useEffect(() => {
    const unlocked = localStorage.getItem("kori_unlocked");
    if (unlocked === "true") {
      setIsLocked(false);
    }
  }, []);

  const handleUnlock = () => {
    setIsLocked(false);
    localStorage.setItem("kori_unlocked", "true");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isMobile ? (
          <MobileBlocker />
        ) : isLocked ? (
          <LockScreen onUnlock={handleUnlock} />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/innovate" element={<Index />} />
              <Route path="/understand" element={<Understand />} />
              <Route path="/lead" element={<ComingSoon />} />
              <Route path="/briefs" element={<ComingSoon />} />
              <Route path="/design" element={<ComingSoon />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
