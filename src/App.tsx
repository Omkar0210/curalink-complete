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
import { AuthPage } from "@/components/auth/AuthPage";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const savedUserType = localStorage.getItem("curalink_user_type");
    if (savedUserType) {
      setUserType(savedUserType as UserType);
      setIsOnboarded(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = (type: UserType) => {
    setUserType(type);
    setIsOnboarded(true);
    localStorage.setItem("curalink_user_type", type);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserType(null);
    setIsOnboarded(false);
    setUser(null);
    setSession(null);
    localStorage.removeItem("curalink_user_type");
  };

  const handleChangeAccountType = () => {
    const newType = userType === "patient" ? "researcher" : "patient";
    setUserType(newType);
    localStorage.setItem("curalink_user_type", newType);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !session) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthPage userType={userType || "patient"} />
            <Chatbot />
            <VoiceAssistant />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

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
                onLogout={handleLogout}
                onChangeAccountType={handleChangeAccountType}
              />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard userType={userType} userId={user.id} />} />
                <Route path="/experts" element={<Experts userId={user.id} />} />
                <Route path="/trials" element={<Trials userId={user.id} />} />
                <Route path="/publications" element={<Publications userId={user.id} />} />
                <Route path="/forums" element={<Forums userId={user.id} userName={user.user_metadata?.name || 'User'} />} />
                <Route path="/favourites" element={<Favourites userId={user.id} />} />
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
