import { ChevronRight, Home, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CategoryBreadcrumbProps {
  category: string | null;
  onNavigate: (path: string | null) => void;
  compact?: boolean;
  onClick?: () => void;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

export function CategoryBreadcrumb({ 
  category, 
  onNavigate, 
  compact = false,
  onClick 
}: CategoryBreadcrumbProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  if (!category || category === "__uncategorized__") {
    return (
      <button
        onClick={onClick || (() => onNavigate(null))}
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          onClick && "hover:text-foreground transition-colors"
        )}
      >
        {compact && <FolderTree className="w-4 h-4" />}
        {!compact && <Home className="w-4 h-4" />}
        <span>
          {category === "__uncategorized__" ? "Okategoriserade" : "Alla dokument"}
        </span>
        {compact && <ChevronRight className="w-3 h-3" />}
      </button>
    );
  }

  const segments = category.split("/");

  return (
    <TooltipProvider delayDuration={300}>
      <nav 
        className={cn(
          "flex items-center gap-1 text-sm overflow-x-auto",
          onClick && "cursor-pointer"
        )}
        onClick={handleClick}
      >
        {compact ? (
          <FolderTree className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(null);
            }}
            className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Home className="w-4 h-4" />
          </button>
        )}

        {segments.map((segment, index) => {
          const path = segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;
          const displayText = compact && !isLast 
            ? truncateText(segment, 4) 
            : segment;
          const isTruncated = compact && !isLast && segment.length > 4;

          const segmentButton = (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!onClick) onNavigate(path);
              }}
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors truncate",
                compact && !isLast ? "max-w-[50px]" : "max-w-[120px]",
                isLast
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                onClick && !isLast && "pointer-events-none"
              )}
            >
              {displayText}
            </button>
          );

          return (
            <div key={path} className="flex items-center gap-1 flex-shrink-0">
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              {isTruncated ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {segmentButton}
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground">
                    {segment}
                  </TooltipContent>
                </Tooltip>
              ) : (
                segmentButton
              )}
            </div>
          );
        })}
        
        {compact && <ChevronRight className="w-3 h-3 text-muted-foreground ml-1" />}
      </nav>
    </TooltipProvider>
  );
}
