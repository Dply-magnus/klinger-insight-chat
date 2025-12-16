import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageNavigationProps {
  currentIndex: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  documentName?: string;
  pageNumber?: number | null;
}

export function PageNavigation({
  currentIndex,
  totalPages,
  onPrevious,
  onNext,
  documentName,
  pageNumber,
}: PageNavigationProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-border/50 bg-card">
      {/* Document info */}
      <div className="flex flex-col min-w-0 flex-1">
        {documentName && (
          <span className="text-sm font-medium text-foreground truncate">
            {documentName}
          </span>
        )}
        {pageNumber !== null && pageNumber !== undefined && (
          <span className="text-xs text-muted-foreground">
            Dokumentsida {pageNumber}
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[80px] text-center">
          {currentIndex + 1} av {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentIndex >= totalPages - 1}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
