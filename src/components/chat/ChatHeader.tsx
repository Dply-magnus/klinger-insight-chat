import { Bot, MoreVertical } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">KLINGER Produktassistent</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>
      
      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
        <MoreVertical className="w-5 h-5 text-muted-foreground" />
      </button>
    </header>
  );
}
