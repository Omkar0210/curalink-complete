import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserType } from "@/lib/types";
import { Navigation } from "@/components/Navigation";
import { Chatbot } from "@/components/Chatbot";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Experts from "./pages/Experts";
import Trials from "./pages/Trials";
import Publications from "./pages/Publications";
import Forums from "./pages/Forums";
import Favourites from "./pages/Favourites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const savedUserType = localStorage.getItem("curalink_user_type");
    if (savedUserType) {
      setUserType(savedUserType as UserType);
      setIsOnboarded(true);
    }
  }, []);

  const handleOnboardingComplete = (type: UserType) => {
    setUserType(type);
    setIsOnboarded(true);
    localStorage.setItem("curalink_user_type", type);
  };

  const handleLogout = () => {
    setUserType(null);
    setIsOnboarded(false);
    localStorage.removeItem("curalink_user_type");
  };

  const handleChangeAccountType = () => {
    const newType = userType === "patient" ? "researcher" : "patient";
    setUserType(newType);
    localStorage.setItem("curalink_user_type", newType);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!isOnboarded || !userType ? (
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : (
            <>
              <Navigation 
                userType={userType} 
                onLogout={handleLogout}
                onChangeAccountType={handleChangeAccountType}
              />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard userType={userType} />} />
                <Route path="/experts" element={<Experts />} />
                <Route path="/trials" element={<Trials />} />
                <Route path="/publications" element={<Publications />} />
                <Route path="/forums" element={<Forums />} />
                <Route path="/favourites" element={<Favourites />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Chatbot />
              <VoiceAssistant />
            </>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
