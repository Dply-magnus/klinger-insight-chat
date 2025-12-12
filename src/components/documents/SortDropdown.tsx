import { ChevronDown, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type SortField = "date" | "title" | "filename" | "extension";
export type SortDirection = "asc" | "desc";

interface SortDropdownProps {
  field: SortField;
  direction: SortDirection;
  onChange: (field: SortField, direction: SortDirection) => void;
}

const sortOptions: { field: SortField; label: string }[] = [
  { field: "date", label: "Datum" },
  { field: "title", label: "Titel" },
  { field: "filename", label: "Filnamn" },
  { field: "extension", label: "Filändelse" },
];

export function SortDropdown({ field, direction, onChange }: SortDropdownProps) {
  const currentLabel = sortOptions.find((o) => o.field === field)?.label;

  const handleSelect = (newField: SortField) => {
    if (newField === field) {
      // Toggle direction if same field
      onChange(field, direction === "asc" ? "desc" : "asc");
    } else {
      // Default to desc for new field
      onChange(newField, "desc");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLabel}</span>
          <span className="text-xs text-muted-foreground">
            ({direction === "asc" ? "↑" : "↓"})
          </span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.field}
            onClick={() => handleSelect(option.field)}
            className="gap-2"
          >
            {option.label}
            {option.field === field && (
              <span className="ml-auto text-xs text-muted-foreground">
                {direction === "asc" ? "↓ fallande" : "↑ stigande"}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
