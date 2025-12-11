import { useRef, useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImagePanel } from "./ImagePanel";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useN8nChat, ChatMessage as ChatMessageType } from "@/hooks/useN8nChat";

export function KlingerChat() {
  const { messages, isLoading, sendMessage } = useN8nChat();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);
  const selectedImages = selectedMessage?.images || [];

  const handleMessageClick = (message: ChatMessageType) => {
    if (message.images?.length) {
      setSelectedMessageId(message.id);
      // Only open drawer on mobile (< lg breakpoint)
      if (window.innerWidth < 1024) {
        setMobileDrawerOpen(true);
      }
    }
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-select latest message with images
  useEffect(() => {
    const latestMessageWithImages = [...messages].reverse().find(m => m.images?.length);
    if (latestMessageWithImages && latestMessageWithImages.id !== selectedMessageId) {
      setSelectedMessageId(latestMessageWithImages.id);
    }
  }, [messages]);

  return (
    <div className="h-screen flex bg-background">
      {/* Left: Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="KLINGER Produktassistent"
          subtitle="Online"
          icon={<Bot className="w-5 h-5 text-primary" />}
        />
        
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
                  htmlContent={message.htmlContent}
                  isSelected={message.id === selectedMessageId}
                  onClick={() => handleMessageClick(message)}
                  hasImages={!!message.images?.length}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 max-w-3xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-secondary-foreground animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:100ms]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </main>

      {/* Right: Image Panel - Desktop */}
      <aside className="w-[380px] flex-shrink-0 bg-panel border-l border-sidebar-border hidden lg:flex flex-col">
        <ImagePanel images={selectedImages} selectedMessageId={selectedMessageId || undefined} />
      </aside>

      {/* Mobile: Image Drawer */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-panel border-t border-sidebar-border p-0 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Dokumentation</SheetTitle>
          </SheetHeader>
          <ImagePanel images={selectedImages} selectedMessageId={selectedMessageId || undefined} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
