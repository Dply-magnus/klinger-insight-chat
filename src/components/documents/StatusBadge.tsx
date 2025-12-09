import { cn } from "@/lib/utils";
import { DocumentStatus } from "@/lib/documentTypes";
import { CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react";

interface StatusBadgeProps {
  status: DocumentStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<DocumentStatus, { 
  label: string; 
  className: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: "Aktiv",
    className: "bg-green-500/20 text-green-600 border-green-500/30",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  pending: {
    label: "Väntar",
    className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    icon: <Clock className="w-3 h-3" />,
  },
  inactive: {
    label: "Inaktiv",
    className: "bg-muted text-muted-foreground border-border",
    icon: <XCircle className="w-3 h-3" />,
  },
  deleted: {
    label: "Raderad",
    className: "bg-destructive/20 text-destructive border-destructive/30",
    icon: <Trash2 className="w-3 h-3" />,
  },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
