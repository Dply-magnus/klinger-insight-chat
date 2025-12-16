import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Columns, Rows3, Grid3X3, Loader2 } from "lucide-react";
import { useTableBuilder } from "@/hooks/useTableBuilder";
import { cn } from "@/lib/utils";

interface TableBuilderChatProps {
  imageUrl: string | null;
  pageId: string;
  currentTable?: { columns: any[]; rows: any[] };
  onApplyData?: (type: string, data: any) => void;
}

const QUICK_ACTIONS = [
  { label: "Identifiera kolumner", icon: Columns, message: "Identifiera kolumngrupperna och produktnamnen i tabellen" },
  { label: "Identifiera rader", icon: Rows3, message: "Identifiera radkategorierna och raderna i tabellen" },
  { label: "Läs av värden", icon: Grid3X3, message: "Läs av cellvärdena i tabellen" },
];

export function TableBuilderChat({ 
  imageUrl, 
  pageId, 
  currentTable,
  onApplyData 
}: TableBuilderChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useTableBuilder({ imageUrl, pageId });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput("");
    await sendMessage(message, currentTable);
  };

  const handleQuickAction = async (message: string) => {
    if (isLoading) return;
    await sendMessage(message, currentTable);
  };

  return (
    <div className="h-full flex flex-col bg-card/50">
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <h3 className="font-medium text-sm">Tabell-dialog</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bygg tabellen steg för steg med AI-assistans
        </p>
      </div>

      {/* Quick actions */}
      <div className="p-2 border-b border-border/50 flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="text-xs h-7 gap-1.5"
            disabled={isLoading || !imageUrl}
            onClick={() => handleQuickAction(action.message)}
          >
            <action.icon className="h-3 w-3" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>Använd snabbknapparna ovan eller ställ en fråga</p>
            <p className="text-xs mt-1">AI:n ser bilden och kan hjälpa dig bygga tabellen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "rounded-lg p-3 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted mr-8"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                
                {/* Only show apply button when agent explicitly sets show_apply: true */}
                {msg.structuredData && 
                 msg.structuredData.type !== "none" && 
                 msg.structuredData.show_apply === true && 
                 onApplyData && (
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => onApplyData(msg.structuredData!.type, msg.structuredData!.data)}
                  >
                    Applicera på tabell
                  </Button>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="bg-muted rounded-lg p-3 mr-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyserar...
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <form 
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ställ en fråga om tabellen..."
            disabled={isLoading || !imageUrl}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim() || !imageUrl}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
