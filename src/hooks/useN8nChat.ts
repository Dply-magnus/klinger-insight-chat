import { useState, useCallback } from 'react';
import { 
  getOrCreateSessionId, 
  sendMessageToN8n, 
  extractImages, 
  parseMarkdown,
  ChatImage
} from '@/lib/n8nChat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  htmlContent?: string;
  images?: ChatImage[];
}

export function useN8nChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(getOrCreateSessionId);

  const sendMessage = useCallback(async (content: string) => {
    // Lägg till användarmeddelande
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Skicka till n8n och vänta på svar
      const botResponse = await sendMessageToN8n(content, sessionId);
      
      // Extrahera bilder och parsa markdown
      const images = extractImages(botResponse);
      const htmlContent = parseMarkdown(botResponse);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: botResponse,
        htmlContent,
        images: images.length > 0 ? images : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to n8n:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Tyvärr kunde jag inte behandla din fråga just nu. Försök igen om en stund.',
        htmlContent: 'Tyvärr kunde jag inte behandla din fråga just nu. Försök igen om en stund.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem('klinger-chat-session');
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    sessionId,
  };
}
