import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OCRImageViewer } from "@/components/review/OCRImageViewer";
import { OCRTextEditor } from "@/components/review/OCRTextEditor";

export default function LayoutTest() {
  const [topHeight, setTopHeight] = useState(40);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Fetch first pending page from ingest_queue
  const { data: page, isLoading } = useQuery({
    queryKey: ["layout-test-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingest_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Ingen pending sida hittades i ingest_queue</p>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col bg-background"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center px-4 shrink-0">
        <h1 className="text-lg font-semibold">Layout Test - {page.filename} (sida {page.page_number})</h1>
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
            imageUrl={page.image_url} 
            filename={page.filename} 
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
            content={page.content || ""}
            pageId={page.id}
            onSave={(data) => console.log("Save:", data)}
            isSaving={false}
          />
        </div>
      </div>
    </div>
  );
}
