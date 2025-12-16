import { useState, useRef, useCallback } from "react";
import { OCRImageViewer } from "@/components/review/OCRImageViewer";
import { OCRTextEditor } from "@/components/review/OCRTextEditor";

export default function LayoutTest() {
  const [topHeight, setTopHeight] = useState(40);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

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

  // Mock data for testing
  const mockContent = JSON.stringify({
    meta: { page_number: 1 },
    page_context: "Detta är testkontext som kan redigeras. Här kan du skriva fri text om sidan.",
    table: {
      has_table: true,
      columns: Array.from({ length: 15 }, (_, i) => `Kolumn ${i + 1}`),
      rows: Array.from({ length: 20 }, (_, i) => ({
        row_label: `Rad ${i + 1}`,
        values: Array.from({ length: 15 }, (_, j) => `R${i + 1}K${j + 1}`)
      }))
    },
    legend: null
  });

  return (
    <div 
      className="h-screen flex flex-col bg-background"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center px-4 shrink-0">
        <h1 className="text-lg font-semibold">Layout Test - Vertikal Split</h1>
      </div>

      {/* Main content container */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col min-h-0"
      >
        {/* Top panel (image) */}
        <div 
          className="overflow-auto bg-muted/20"
          style={{ height: `${topHeight}%` }}
        >
          <OCRImageViewer 
            imageUrl="https://via.placeholder.com/1200x800" 
            filename="test-bild.png" 
          />
        </div>

        {/* Resize handle */}
        <div 
          className="h-2 bg-border hover:bg-primary/50 cursor-row-resize shrink-0 flex items-center justify-center transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1 bg-muted-foreground/30 rounded" />
        </div>

        {/* Bottom panel (text) */}
        <div className="flex-1 min-h-0 overflow-auto bg-card/50">
          <OCRTextEditor
            content={mockContent}
            pageId="test-page"
            onSave={(data) => console.log("Save:", data)}
            isSaving={false}
          />
        </div>
      </div>
    </div>
  );
}
