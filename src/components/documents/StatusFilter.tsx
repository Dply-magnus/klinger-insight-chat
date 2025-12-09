import { cn } from "@/lib/utils";
import { DocumentStatus } from "@/lib/documentTypes";

interface StatusFilterProps {
  selected: DocumentStatus | "all";
  onChange: (status: DocumentStatus | "all") => void;
  counts: Record<DocumentStatus | "all", number>;
}

const filterOptions: { value: DocumentStatus | "all"; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "active", label: "Aktiva" },
  { value: "pending", label: "Väntar" },
  { value: "inactive", label: "Inaktiva" },
  { value: "deleted", label: "Raderade" },
];

export function StatusFilter({ selected, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            selected === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {option.label}
          <span className="ml-1.5 text-xs opacity-70">({counts[option.value]})</span>
        </button>
      ))}
    </div>
  );
}
