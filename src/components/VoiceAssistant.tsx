import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = "1997e499-bcaf-4762-bab1-caae33735e04";
const ASSISTANT_ID = "350e5c66-88a2-493d-9958-a2b955ad94de";

export function VoiceAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    console.log("[VoiceAssistant] Initializing VAPI instance");
    
    try {
      const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapiInstance;

      // Listen to call events
      vapiInstance.on("call-start", () => {
        console.log("[VoiceAssistant] Call started");
        setIsActive(true);
        setIsLoading(false);
        setError("");
      });

      vapiInstance.on("call-end", () => {
        console.log("[VoiceAssistant] Call ended");
        setIsActive(false);
        setIsLoading(false);
      });

      vapiInstance.on("error", (e) => {
        console.error("[VoiceAssistant] Error:", e);
        setError(e.message || "An error occurred");
        setIsLoading(false);
        setIsActive(false);
      });

      vapiInstance.on("message", (message) => {
        console.log("[VoiceAssistant] Message:", message);
      });

      console.log("[VoiceAssistant] VAPI instance initialized successfully");
    } catch (err) {
      console.error("[VoiceAssistant] Failed to initialize VAPI:", err);
      setError("Failed to initialize voice assistant");
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  const startCall = async () => {
    if (!vapiRef.current) {
      console.error("[VoiceAssistant] VAPI not initialized");
      setError("Voice assistant not ready");
      return;
    }

    console.log("[VoiceAssistant] Starting call...");
    setIsLoading(true);
    setError("");

    try {
      await vapiRef.current.start(ASSISTANT_ID);
      console.log("[VoiceAssistant] Call started successfully");
    } catch (error) {
      console.error("[VoiceAssistant] Error starting call:", error);
      setError(`Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (!vapiRef.current) {
      console.error("[VoiceAssistant] VAPI not initialized");
      return;
    }

    console.log("[VoiceAssistant] Ending call...");
    try {
      vapiRef.current.stop();
      console.log("[VoiceAssistant] Call ended successfully");
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
            disabled={isLoading || !vapiRef.current}
            title={
              isLoading 
                ? "Starting voice call..." 
                : !vapiRef.current 
                ? "Voice assistant unavailable" 
                : "Start voice call"
            }
          >
            <Mic className="h-6 w-6" />
          </Button>
          {isLoading && (
            <div className="text-xs text-muted-foreground bg-card px-2 py-1 rounded shadow">
              Starting...
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
