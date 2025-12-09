import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBreadcrumbProps {
  category: string | null;
  onNavigate: (path: string | null) => void;
}

export function CategoryBreadcrumb({ category, onNavigate }: CategoryBreadcrumbProps) {
  if (!category || category === "__uncategorized__") {
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Home className="w-4 h-4" />
        <span>
          {category === "__uncategorized__" ? "Okategoriserade" : "Alla dokument"}
        </span>
      </div>
    );
  }

  const segments = category.split("/");

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      <button
        onClick={() => onNavigate(null)}
        className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <Home className="w-4 h-4" />
      </button>

      {segments.map((segment, index) => {
        const path = segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <div key={path} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <button
              onClick={() => onNavigate(path)}
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors truncate max-w-[120px]",
                isLast
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {segment}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
