import { useEffect } from "react";

// Declare custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'zapier-interfaces-chatbot-embed': any;
    }
  }
}

export function Chatbot() {
  useEffect(() => {
    // Load Zapier chatbot script
    const script = document.createElement("script");
    script.src = "https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js";
    script.type = "module";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <zapier-interfaces-chatbot-embed 
        is-popup="true" 
        chatbot-id="cmi11sla5005713swisdbjl10"
      />
    </>
  );
}
