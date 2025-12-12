import { useState, useMemo } from "react";
import { ChevronDown, Folder, FolderPlus, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryNode } from "@/lib/documentTypes";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  value: string | undefined;
  categories: CategoryNode[];
  onChange: (category: string | undefined) => void;
  placeholder?: string;
}

export function CategorySelect({
  value,
  categories,
  onChange,
  placeholder = "Välj kategori",
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const displayValue = value || placeholder;

  const handleSelect = (path: string) => {
    onChange(path);
    setOpen(false);
  };

  const handleCreateCategory = () => {
    if (newCategoryInput.trim()) {
      onChange(newCategoryInput.trim());
      setNewCategoryInput("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            <Folder className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            <span className={cn(!value && "text-muted-foreground")}>
              {displayValue}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-popover" align="start">
        <div className="max-h-[300px] overflow-y-auto p-2">
          {/* No category option */}
          <button
            onClick={() => handleSelect("")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              !value
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            )}
          >
            <span className={cn(!value ? "text-white" : "text-muted-foreground")}>Ingen kategori</span>
          </button>

          {/* Existing categories */}
          {categories.map((category) => (
            <CategorySelectItem
              key={category.path}
              category={category}
              selectedValue={value}
              onSelect={handleSelect}
              level={0}
            />
          ))}
        </div>

        {/* Create new category */}
        <div className="border-t border-border p-2">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Ny kategori (t.ex. Produkter/Ventiler)"
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCreateCategory}
              disabled={!newCategoryInput.trim()}
            >
              Skapa
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            Använd / för att skapa undermappar
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface CategorySelectItemProps {
  category: CategoryNode;
  selectedValue: string | undefined;
  onSelect: (path: string) => void;
  level: number;
}

function CategorySelectItem({
  category,
  selectedValue,
  onSelect,
  level,
}: CategorySelectItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    selectedValue?.startsWith(category.path) || false
  );
  const hasChildren = category.children.length > 0;
  const isSelected = selectedValue === category.path;

  return (
    <div>
      <button
        onClick={() => onSelect(category.path)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors group",
          isSelected
            ? "bg-accent text-accent-foreground"
            : "hover:bg-muted"
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 -ml-1 hover:bg-muted rounded"
          >
            <ChevronRight
              className={cn(
                "w-3 h-3 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="w-4" />
        )}

        <Folder className={cn(
          "w-4 h-4 transition-colors",
          isSelected 
            ? "text-white" 
            : "text-muted-foreground group-hover:text-foreground"
        )} />
        <span className="flex-1 text-left truncate">{category.name}</span>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {category.children.map((child) => (
            <CategorySelectItem
              key={child.path}
              category={child}
              selectedValue={selectedValue}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
