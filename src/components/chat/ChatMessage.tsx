import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  htmlContent?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ChatMessage({ role, content, htmlContent, isSelected, onClick }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group flex gap-3 p-4 transition-all duration-200 cursor-pointer rounded-xl",
        isUser ? "flex-row-reverse" : "flex-row",
        isSelected && !isUser && "bg-secondary/50 ring-1 ring-primary/20",
        !isSelected && "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "flex-1 max-w-[80%]",
          isUser && "text-right"
        )}
      >
        <div
          className={cn(
            "inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser 
              ? "bg-chat-user text-chat-user-foreground rounded-br-md" 
              : "bg-chat-bot text-chat-bot-foreground shadow-sm border border-border/50 rounded-bl-md"
          )}
        >
          {role === 'assistant' && htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}
