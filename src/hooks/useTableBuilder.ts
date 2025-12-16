import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase.functions.invoke('table-builder-agent', {
        body: {
          sessionId,
          image_url: imageUrl,
          message,
          current_table: currentTable || { columns: [], rows: [] },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      
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
