import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = "37ad4adf-8b61-4c44-9a37-621777763b29";
const ASSISTANT_ID = "bff9cfc5-1d55-4875-a63d-a83b5def5b70";

export function VoiceAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    console.log("[VoiceAssistant] 🚀 Initializing VAPI instance");
    
    try {
      const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapiInstance;

      // Listen to call events
      vapiInstance.on("call-start", () => {
        console.log("[VoiceAssistant] ✅ Call started");
        setIsActive(true);
        setIsLoading(false);
        setError("");
      });

      vapiInstance.on("call-end", () => {
        console.log("[VoiceAssistant] 📞 Call ended");
        setIsActive(false);
        setIsLoading(false);
      });

      vapiInstance.on("error", (e) => {
        console.error("[VoiceAssistant] ❌ Error:", e);
        setError(e.message || "An error occurred");
        setIsLoading(false);
        setIsActive(false);
      });

      vapiInstance.on("message", (message) => {
        console.log("[VoiceAssistant] 💬 Message:", message);
      });

      console.log("[VoiceAssistant] ✅ VAPI instance initialized successfully", vapiInstance);
    } catch (err) {
      console.error("[VoiceAssistant] ❌ Failed to initialize VAPI:", err);
      setError("Failed to initialize voice assistant");
    }

    return () => {
      if (vapiRef.current) {
        console.log("[VoiceAssistant] 🧹 Cleaning up VAPI instance");
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  const handleStartCall = async () => {
    console.log("[VoiceAssistant] 🔵 BUTTON CLICKED - Starting call process...");
    console.log("[VoiceAssistant] 🔍 vapiRef.current:", vapiRef.current);
    
    if (!vapiRef.current) {
      console.error("[VoiceAssistant] ❌ VAPI not initialized");
      setError("Voice assistant not ready");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Request microphone permission first
      console.log("[VoiceAssistant] 🎤 Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[VoiceAssistant] ✅ Microphone permission granted", stream);

      // Start the call
      console.log("[VoiceAssistant] 📞 Calling vapi.start() with assistantId:", ASSISTANT_ID);
      const result = await vapiRef.current.start(ASSISTANT_ID);
      console.log("[VoiceAssistant] ✅ vapi.start() completed successfully", result);
    } catch (error) {
      console.error("[VoiceAssistant] ❌ ERROR in startCall:", error);
      console.error("[VoiceAssistant] ❌ Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed: ${errorMsg}`);
      setIsLoading(false);
      setIsActive(false);
    }
  };

  const handleEndCall = () => {
    console.log("[VoiceAssistant] 🔴 END CALL BUTTON CLICKED");
    
    if (!vapiRef.current) {
      console.error("[VoiceAssistant] ❌ VAPI not initialized for ending call");
      return;
    }

    try {
      console.log("[VoiceAssistant] 📞 Calling vapi.stop()...");
      vapiRef.current.stop();
      console.log("[VoiceAssistant] ✅ Call ended successfully");
    } catch (error) {
      console.error("[VoiceAssistant] ❌ Error ending call:", error);
      setError("Failed to end call");
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {error && (
        <div className="mb-2 max-w-xs text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg shadow-lg">
          <div className="font-semibold mb-1">Voice Error</div>
          <div>{error}</div>
        </div>
      )}
      
      {!isActive ? (
        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            onClick={handleStartCall}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110",
              isLoading && "opacity-50 animate-pulse"
            )}
            title="Start voice call"
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
            onClick={handleEndCall}
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
