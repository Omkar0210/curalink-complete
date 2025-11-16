import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    vapiSDK: any;
  }
}

export function VoiceAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vapi, setVapi] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    console.log("[VoiceAssistant] Component mounted, loading VAPI SDK...");
    
    // Check if SDK is already loaded
    if (window.vapiSDK) {
      console.log("[VoiceAssistant] VAPI SDK already loaded");
      try {
        const vapiInstance = window.vapiSDK("1997e499-bcaf-4762-bab1-caae33735e04");
        console.log("[VoiceAssistant] VAPI instance created:", vapiInstance);
        setVapi(vapiInstance);
        setIsLoading(false);
        return;
      } catch (err) {
        console.error("[VoiceAssistant] Error creating VAPI instance:", err);
        setError("Failed to initialize voice assistant");
        setIsLoading(false);
        return;
      }
    }

    // Load VAPI SDK
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.async = true;
    
    const timeout = setTimeout(() => {
      console.error("[VoiceAssistant] SDK loading timeout");
      setError("Voice assistant loading timeout");
      setIsLoading(false);
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      console.log("[VoiceAssistant] VAPI SDK loaded successfully");
      console.log("[VoiceAssistant] window.vapiSDK exists:", !!window.vapiSDK);
      
      if (window.vapiSDK) {
        try {
          console.log("[VoiceAssistant] Creating VAPI instance with key: 1997e499-bcaf-4762-bab1-caae33735e04");
          const vapiInstance = window.vapiSDK("1997e499-bcaf-4762-bab1-caae33735e04");
          console.log("[VoiceAssistant] VAPI instance created successfully:", vapiInstance);
          setVapi(vapiInstance);
          setIsLoading(false);
        } catch (err) {
          console.error("[VoiceAssistant] Error creating VAPI instance:", err);
          setError("Failed to initialize voice assistant");
          setIsLoading(false);
        }
      } else {
        console.error("[VoiceAssistant] VAPI SDK not found on window after load");
        setError("Voice assistant SDK not available");
        setIsLoading(false);
      }
    };
    
    script.onerror = (err) => {
      clearTimeout(timeout);
      console.error("[VoiceAssistant] Failed to load VAPI SDK:", err);
      setError("Failed to load voice assistant");
      setIsLoading(false);
    };
    
    document.body.appendChild(script);
    console.log("[VoiceAssistant] SDK script added to document");

    return () => {
      clearTimeout(timeout);
      if (script.parentNode) {
        document.body.removeChild(script);
        console.log("[VoiceAssistant] Cleanup: SDK script removed");
      }
    };
  }, []);

  const startCall = async () => {
    if (!vapi) {
      console.error("[VoiceAssistant] VAPI not initialized, cannot start call");
      setError("Voice assistant not ready");
      return;
    }
    
    console.log("[VoiceAssistant] Starting voice call...");
    console.log("[VoiceAssistant] VAPI instance:", vapi);
    console.log("[VoiceAssistant] Assistant ID: 350e5c66-88a2-493d-9958-a2b955ad94de");
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await vapi.start("350e5c66-88a2-493d-9958-a2b955ad94de");
      console.log("[VoiceAssistant] Voice call started successfully:", result);
      setIsActive(true);
    } catch (error) {
      console.error("[VoiceAssistant] Error starting call:", error);
      console.error("[VoiceAssistant] Error details:", JSON.stringify(error, null, 2));
      setError(`Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (!vapi) {
      console.error("[VoiceAssistant] VAPI not initialized, cannot end call");
      return;
    }
    
    console.log("[VoiceAssistant] Ending voice call...");
    try {
      vapi.stop();
      console.log("[VoiceAssistant] Voice call ended successfully");
      setIsActive(false);
      setError("");
    } catch (error) {
      console.error("[VoiceAssistant] Error ending call:", error);
      setError("Failed to end call");
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {error && (
        <div className="mb-2 max-w-xs text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg shadow-lg">
          <div className="font-semibold mb-1">Voice Assistant Error</div>
          <div>{error}</div>
          {!vapi && !isLoading && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          )}
        </div>
      )}
      {!isActive ? (
        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110",
              isLoading && "opacity-50 cursor-not-allowed animate-pulse"
            )}
            onClick={startCall}
            disabled={isLoading || !vapi}
            title={
              isLoading 
                ? "Loading voice assistant..." 
                : !vapi 
                ? "Voice assistant unavailable" 
                : "Start voice call"
            }
          >
            <Mic className="h-6 w-6" />
          </Button>
          {isLoading && (
            <div className="text-xs text-muted-foreground bg-card px-2 py-1 rounded shadow">
              Loading...
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center">
          <div className="h-14 w-14 rounded-full bg-primary animate-pulse flex items-center justify-center shadow-lg">
            <Mic className="h-6 w-6 text-primary-foreground" />
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={endCall}
            className="rounded-full shadow-lg"
          >
            <Phone className="h-4 w-4 mr-1" />
            End Call
          </Button>
        </div>
      )}
    </div>
  );
}
