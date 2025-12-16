import { useState, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  structuredData?: {
    type: "columns" | "rows" | "values";
    data: any;
  };
}

interface UseTableBuilderProps {
  imageUrl: string | null;
  pageId: string;
}

const WEBHOOK_URL = "https://dplymf.app.n8n.cloud/webhook/696f54ba-6bbb-4bae-9646-d85e6435a683";

export function useTableBuilder({ imageUrl, pageId }: UseTableBuilderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `table-${pageId}-${Date.now()}`);

  const sendMessage = useCallback(async (
    message: string,
    currentTable?: { columns: any[]; rows: any[] }
  ) => {
    if (!imageUrl) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          image_url: imageUrl,
          message,
          current_table: currentTable || { columns: [], rows: [] },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || data.output || data.text || "Inget svar mottaget",
        structuredData: data.structured_data,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch (error) {
      console.error("Table builder error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Fel vid kommunikation med agenten: ${error instanceof Error ? error.message : "Okänt fel"}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [imageUrl, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    sessionId,
  };
}
