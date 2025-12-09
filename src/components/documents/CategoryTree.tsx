import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, FileStack, HelpCircle } from "lucide-react";
import { CategoryNode } from "@/lib/documentTypes";
import { cn } from "@/lib/utils";

interface CategoryTreeProps {
  categories: CategoryNode[];
  selectedCategory: string | null;
  onSelectCategory: (path: string | null) => void;
  totalCount: number;
  uncategorizedCount: number;
}

export function CategoryTree({
  categories,
  selectedCategory,
  onSelectCategory,
  totalCount,
  uncategorizedCount,
}: CategoryTreeProps) {
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Kategorier
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {/* All documents */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          )}
        >
          <FileStack className="w-4 h-4" />
          <span className="flex-1 text-left">Alla dokument</span>
          <span className={cn(
            "text-xs",
            selectedCategory === null ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>{totalCount}</span>
        </button>

        {/* Category tree */}
        {categories.map((category) => (
          <CategoryItem
            key={category.path}
            category={category}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            level={0}
          />
        ))}

        {/* Uncategorized */}
        {uncategorizedCount > 0 && (
          <button
            onClick={() => onSelectCategory("__uncategorized__")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-2",
              selectedCategory === "__uncategorized__"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="flex-1 text-left">Okategoriserade</span>
            <span className={cn(
              "text-xs",
              selectedCategory === "__uncategorized__" ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>{uncategorizedCount}</span>
          </button>
        )}
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: CategoryNode;
  selectedCategory: string | null;
  onSelectCategory: (path: string | null) => void;
  level: number;
}

function CategoryItem({
  category,
  selectedCategory,
  onSelectCategory,
  level,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    selectedCategory?.startsWith(category.path) || false
  );
  const hasChildren = category.children.length > 0;
  const isSelected = selectedCategory === category.path;
  const isParentOfSelected = selectedCategory?.startsWith(category.path + "/") || false;

  const handleClick = () => {
    onSelectCategory(category.path);
    if (hasChildren && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground"
            : isParentOfSelected
            ? "text-foreground font-medium"
            : "text-foreground hover:bg-muted"
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={handleToggle}
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
        
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-primary" />
        ) : (
          <Folder className={cn(
            "w-4 h-4",
            isSelected ? "text-primary-foreground" : "text-muted-foreground"
          )} />
        )}
        
        <span className="flex-1 text-left truncate">{category.name}</span>
        <span className={cn(
          "text-xs",
          isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {category.documentCount}
        </span>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {category.children.map((child) => (
            <CategoryItem
              key={child.path}
              category={child}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
