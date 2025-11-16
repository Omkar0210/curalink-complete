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
  const [isLoading, setIsLoading] = useState(false);
  const [vapi, setVapi] = useState<any>(null);

  useEffect(() => {
    // Load VAPI SDK
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.async = true;
    script.onload = () => {
      if (window.vapiSDK) {
        const vapiInstance = window.vapiSDK("8c91c3b0-bdef-4ceb-aec7-77f6653e8185");
        setVapi(vapiInstance);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const startCall = async () => {
    if (!vapi) return;
    
    setIsLoading(true);
    try {
      await vapi.start("350e5c66-88a2-493d-9958-a2b955ad94de");
      setIsActive(true);
    } catch (error) {
      console.error("Error starting call:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (!vapi) return;
    
    vapi.stop();
    setIsActive(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {!isActive ? (
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          onClick={startCall}
          disabled={isLoading || !vapi}
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
