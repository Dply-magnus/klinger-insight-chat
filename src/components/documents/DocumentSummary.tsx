import { Document, DocumentStatus } from "@/lib/documentTypes";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ClipboardList, CheckCircle, Clock, XCircle } from "lucide-react";

interface DocumentSummaryProps {
  documents: Document[];
  onFilterClick: (status: DocumentStatus | "all") => void;
  activeFilter: DocumentStatus | "all";
}

export function DocumentSummary({ documents, onFilterClick, activeFilter }: DocumentSummaryProps) {
  const counts = useMemo(() => {
    const result = {
      all: documents.length,
      pending: 0,
      active: 0,
      inactive: 0,
    };

    documents.forEach((doc) => {
      result[doc.currentVersion.status]++;
    });

    return result;
  }, [documents]);

  const cards = [
    {
      value: "pending" as const,
      label: "Att granska",
      count: counts.pending,
      icon: Clock,
      colorClass: "text-yellow-500",
      bgClass: "bg-yellow-500/10",
      highlight: counts.pending > 0,
    },
    {
      value: "active" as const,
      label: "Aktiva",
      count: counts.active,
      icon: CheckCircle,
      colorClass: "text-green-500",
      bgClass: "bg-green-500/10",
      highlight: false,
    },
    {
      value: "inactive" as const,
      label: "Inaktiva",
      count: counts.inactive,
      icon: XCircle,
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted",
      highlight: false,
    },
    {
      value: "all" as const,
      label: "Totalt",
      count: counts.all,
      icon: ClipboardList,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-4 border-b border-border bg-muted/30">
      {cards.map((card) => (
        <button
          key={card.value}
          onClick={() => onFilterClick(card.value)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all",
            "hover:bg-muted/80",
            activeFilter === card.value && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            card.highlight && "animate-pulse"
          )}
        >
          <div className={cn("p-2 rounded-lg", card.bgClass)}>
            <card.icon className={cn("w-4 h-4", card.colorClass)} />
          </div>
          <div className="text-left">
            <p className={cn("text-lg font-bold", card.colorClass)}>
              {card.count}
            </p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
