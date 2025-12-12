import { cn } from "@/lib/utils";
import { DocumentStatus } from "@/lib/documentTypes";

interface StatusFilterProps {
  selected: DocumentStatus | "all";
  onChange: (status: DocumentStatus | "all") => void;
  counts: Record<DocumentStatus | "all", number>;
}

const filterOptions: { value: DocumentStatus | "all"; label: string; highlight?: boolean }[] = [
  { value: "all", label: "Alla" },
  { value: "pending", label: "Att granska", highlight: true },
  { value: "active", label: "Aktiva" },
  { value: "inactive", label: "Inaktiva" },
];

export function StatusFilter({ selected, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((option) => {
        const hasPending = option.highlight && counts.pending > 0;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all relative",
              selected === option.value
                ? option.highlight
                  ? "bg-yellow-500 text-yellow-950"
                  : "bg-primary text-primary-foreground"
                : option.highlight && counts.pending > 0
                  ? "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 border border-yellow-500/50"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {option.label}
            <span className={cn(
              "ml-1.5 text-xs",
              selected === option.value ? "opacity-80" : "opacity-70"
            )}>
              ({counts[option.value]})
            </span>
            {hasPending && selected !== option.value && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
