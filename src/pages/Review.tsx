import { useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useIngestQueue } from "@/hooks/useIngestQueue";
import { OCRImageViewer } from "@/components/review/OCRImageViewer";
import { OCRTextEditor } from "@/components/review/OCRTextEditor";
import { PageNavigation } from "@/components/review/PageNavigation";
import { Button } from "@/components/ui/button";
import { Send, Loader2, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Review() {
  const {
    pendingPages,
    pendingCount,
    isLoading,
    updateContent,
    isUpdating,
    approvePages,
    isApproving,
  } = useIngestQueue();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [topHeight, setTopHeight] = useState(40);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isMobile = useIsMobile();

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
    setTopHeight(Math.min(Math.max(newHeight, 20), 80));
  }, []);

  const currentPage = pendingPages[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(pendingPages.length - 1, prev + 1));
  };

  const handleApproveAll = () => {
    const pageIds = pendingPages.map(p => p.id);
    approvePages(pageIds);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader
        title="Granska OCR"
        subtitle={`${pendingCount} sidor att granska`}
        icon={<FileText className="h-6 w-6 text-primary" />}
      />

      {pendingCount === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Inga sidor att granska
            </h2>
            <p className="text-muted-foreground">
              Alla OCR-sidor har granskats och skickats för vektorisering.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page navigation */}
          <PageNavigation
            currentIndex={currentIndex}
            totalPages={pendingCount}
            onPrevious={handlePrevious}
            onNext={handleNext}
            documentName={currentPage?.document?.name || currentPage?.filename || undefined}
            pageNumber={currentPage?.page_number}
          />

          {/* Main content area */}
          {isMobile ? (
            <Tabs defaultValue="text" className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
                <TabsTrigger value="image" className="flex-1">Bild</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="flex-1 m-0 p-2">
                {currentPage && (
                  <OCRTextEditor
                    content={currentPage.content}
                    pageId={currentPage.id}
                    onSave={updateContent}
                    isSaving={isUpdating}
                  />
                )}
              </TabsContent>
              <TabsContent value="image" className="flex-1 m-0 p-2">
                <OCRImageViewer
                  imageUrl={currentPage?.image_url || null}
                  filename={currentPage?.filename || null}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div 
              ref={containerRef}
              className="flex-1 flex flex-col min-h-0"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Övre panel (bild) */}
              <div 
                className="overflow-auto bg-muted/20 shrink-0"
                style={{ height: `${topHeight}%` }}
              >
                <OCRImageViewer
                  imageUrl={currentPage?.image_url || null}
                  filename={currentPage?.filename || null}
                />
              </div>

              {/* Resize handle */}
              <div 
                className="h-2 bg-border hover:bg-primary/50 cursor-row-resize shrink-0 flex items-center justify-center transition-colors"
                onMouseDown={handleMouseDown}
              >
                <div className="w-12 h-1 bg-muted-foreground/30 rounded" />
              </div>

              {/* Nedre panel (text) */}
              <div className="flex-1 min-h-0 overflow-auto bg-card/50">
                {currentPage && (
                  <OCRTextEditor
                    content={currentPage.content}
                    pageId={currentPage.id}
                    onSave={updateContent}
                    isSaving={isUpdating}
                  />
                )}
              </div>
            </div>
          )}

          {/* Approve button */}
          <div className="p-4 border-t border-border/50 bg-card">
            <Button
              onClick={handleApproveAll}
              disabled={isApproving || pendingCount === 0}
              className="w-full sm:w-auto gap-2"
              size="lg"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Godkänn alla & skicka till n8n ({pendingCount} sidor)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
