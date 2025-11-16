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
import MyResearch from "./pages/MyResearch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
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

  const handleChangeAccountType = () => {
    const newType = userType === "patient" ? "researcher" : "patient";
    setUserType(newType);
    setIsOnboarded(false); // Show onboarding form to edit/enter information
    localStorage.setItem("curalink_user_type", newType);
  };

  const handleLogout = () => {
    setUserType(null);
    setIsOnboarded(false);
    localStorage.removeItem("curalink_user_type");
    localStorage.removeItem("curalink_patient_data");
    localStorage.removeItem("curalink_researcher_data");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!isOnboarded || !userType ? (
            <>
              <Onboarding onComplete={handleOnboardingComplete} />
              <Chatbot />
              <VoiceAssistant />
            </>
          ) : (
            <>
              <Navigation 
                userType={userType} 
                onChangeAccountType={handleChangeAccountType}
                onLogout={handleLogout}
              />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/myresearch" element={<MyResearch userId="guest" />} />
                <Route path="/dashboard" element={<Dashboard userType={userType} userId="guest" />} />
                <Route path="/experts" element={<Experts userId="guest" userType={userType} />} />
                <Route path="/trials" element={<Trials userId="guest" />} />
                <Route path="/publications" element={<Publications userId="guest" />} />
                <Route path="/forums" element={<Forums userId="guest" userName="Guest" />} />
                <Route path="/favourites" element={<Favourites userId="guest" />} />
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
