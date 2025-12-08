import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ställ en fråga om Klingers produkter..."
          disabled={disabled}
          className={cn(
            "flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            "p-3 rounded-xl bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary",
            "shadow-sm hover:shadow-md"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
