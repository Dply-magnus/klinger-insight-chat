import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ImagePanel } from "./ImagePanel";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: {
    id: string;
    url: string;
    title: string;
    page?: number;
  }[];
}

// Dummy data for demonstration
const dummyMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Vilka packningar rekommenderar ni för högtrycksapplikationer?",
  },
  {
    id: "2",
    role: "assistant",
    content: "För högtrycksapplikationer rekommenderar vi KLINGER® Quantum, som är optimerad för tryck upp till 250 bar. Den har utmärkt kemisk resistens och lång livslängd. Se dokumentationen för fullständiga specifikationer.",
    images: [
      {
        id: "img1",
        url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=1000&fit=crop",
        title: "KLINGER Quantum - Teknisk specifikation",
        page: 1,
      },
    ],
  },
  {
    id: "3",
    role: "user",
    content: "Finns det alternativ för kemiskt aggressiva miljöer?",
  },
  {
    id: "4",
    role: "assistant",
    content: "Absolut! För kemiskt aggressiva miljöer har vi flera alternativ beroende på specifik kemikalie och temperatur. KLINGER® SIL C-4430 är populär för syror, medan KLINGER® Graphit PSM passar för alkaliska miljöer. Jag bifogar produktblad för båda.",
    images: [
      {
        id: "img2",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=1000&fit=crop",
        title: "KLINGER SIL C-4430 - Produktblad",
        page: 12,
      },
      {
        id: "img3",
        url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=1000&fit=crop",
        title: "KLINGER Graphit PSM - Kemisk resistens",
        page: 8,
      },
      {
        id: "img4",
        url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=1000&fit=crop",
        title: "Jämförelsetabell kemikalieresistens",
        page: 15,
      },
    ],
  },
  {
    id: "5",
    role: "user",
    content: "Tack! Vad är leveranstiden för SIL C-4430?",
  },
  {
    id: "6",
    role: "assistant",
    content: "KLINGER SIL C-4430 finns normalt i lager med leveranstid 2-3 arbetsdagar inom Sverige. För större kvantiteter eller specialdimensioner kan leveranstiden vara 1-2 veckor. Kontakta gärna vår kundtjänst för exakt leveransbesked på din specifika order.",
  },
];

export function KlingerChat() {
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>("4");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);
  const selectedImages = selectedMessage?.images || [];

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Tack för din fråga! Jag analyserar produktkatalogen och återkommer med relevant information.",
      };
      setMessages((prev) => [...prev, newBotMessage]);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex bg-background">
      {/* Left: Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-chat-panel">
          <div className="max-w-3xl mx-auto py-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "animate-fade-in",
                  index > 0 && "mt-1"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  isSelected={message.id === selectedMessageId}
                  onClick={() => message.images?.length ? setSelectedMessageId(message.id) : null}
                  hasImages={!!message.images?.length}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput onSend={handleSendMessage} />
      </main>

      {/* Right: Image Panel */}
      <aside className="w-[380px] flex-shrink-0 bg-panel border-l border-sidebar-border hidden lg:flex flex-col">
        <ImagePanel images={selectedImages} selectedMessageId={selectedMessageId || undefined} />
      </aside>
    </div>
  );
}
