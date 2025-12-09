import { FileType } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtensionFilterProps {
  extensions: string[];
  selected: string | "all";
  onChange: (ext: string | "all") => void;
}

export function ExtensionFilter({
  extensions,
  selected,
  onChange,
}: ExtensionFilterProps) {
  if (extensions.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
      <button
        onClick={() => onChange("all")}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
          selected === "all"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        <FileType className="w-3 h-3" />
        Alla
      </button>

      {extensions.map((ext) => (
        <button
          key={ext}
          onClick={() => onChange(ext)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap uppercase",
            selected === ext
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          .{ext}
        </button>
      ))}
    </div>
  );
}
