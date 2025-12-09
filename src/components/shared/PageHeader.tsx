import { Bot, FileText, MoreVertical } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  const location = useLocation();
  const isChat = location.pathname === "/";
  const isDocuments = location.pathname === "/documents";

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          {icon || <Bot className="w-5 h-5 text-primary" />}
        </div>
        <div>
          <h1 className="font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Navigation tabs */}
        <nav className="flex items-center bg-muted rounded-lg p-1 mr-2">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isChat
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </Link>
          <Link
            to="/documents"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isDocuments
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Dokument</span>
          </Link>
        </nav>

        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
