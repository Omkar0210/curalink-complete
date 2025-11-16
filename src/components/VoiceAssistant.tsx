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
    console.log("Loading VAPI SDK...");
    // Load VAPI SDK
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.async = true;
    script.onload = () => {
      console.log("VAPI SDK loaded successfully");
      if (window.vapiSDK) {
        try {
          const vapiInstance = window.vapiSDK("8c91c3b0-bdef-4ceb-aec7-77f6653e8185");
          console.log("VAPI instance created:", vapiInstance);
          setVapi(vapiInstance);
          setIsLoading(false);
        } catch (err) {
          console.error("Error creating VAPI instance:", err);
          setError("Failed to initialize voice assistant");
          setIsLoading(false);
        }
      } else {
        console.error("VAPI SDK not found on window");
        setError("Voice assistant SDK not available");
        setIsLoading(false);
      }
    };
    script.onerror = () => {
      console.error("Failed to load VAPI SDK");
      setError("Failed to load voice assistant");
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const startCall = async () => {
    if (!vapi) {
      console.error("VAPI not initialized");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Starting voice call...");
      await vapi.start("350e5c66-88a2-493d-9958-a2b955ad94de");
      console.log("Voice call started");
      setIsActive(true);
    } catch (error) {
      console.error("Error starting call:", error);
      setError("Failed to start voice call");
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (!vapi) {
      console.error("VAPI not initialized");
      return;
    }
    
    console.log("Ending voice call...");
    vapi.stop();
    setIsActive(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {error && (
        <div className="mb-2 text-xs text-destructive bg-destructive/10 px-3 py-1 rounded">
          {error}
        </div>
      )}
      {!isActive ? (
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          onClick={startCall}
          disabled={isLoading || !vapi}
          title={isLoading ? "Loading..." : !vapi ? "Voice assistant unavailable" : "Start voice call"}
        >
          <Mic className="h-6 w-6" />
        </Button>
      ) : (
        <div className="flex flex-col gap-2 items-center">
          <div className="h-14 w-14 rounded-full bg-primary animate-pulse flex items-center justify-center">
            <Mic className="h-6 w-6 text-primary-foreground" />
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={endCall}
            className="rounded-full"
          >
            <Phone className="h-4 w-4 mr-1" />
            End Call
          </Button>
        </div>
      )}
    </div>
  );
}
