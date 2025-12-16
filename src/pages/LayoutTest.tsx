import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OCRImageViewer } from "@/components/review/OCRImageViewer";
import { OCRTextEditor } from "@/components/review/OCRTextEditor";
import { TableBuilderChat } from "@/components/review/TableBuilderChat";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { parseOCRContent, stringifyOCRContent, OCRJsonContent } from "@/lib/ocrTypes";

export default function LayoutTest() {
  const [topHeight, setTopHeight] = useState(40);
  const [editedContent, setEditedContent] = useState<string | null>(null);
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
        .eq("page_number", 2)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Initialize editedContent when page loads
  useEffect(() => {
    if (page?.content) {
      setEditedContent(page.content);
    }
  }, [page?.content]);

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
    setTopHeight(Math.min(Math.max(newHeight, 20), 80));
  }, []);

  // Get current table from content
  const getCurrentTable = useCallback(() => {
    if (!editedContent) return { columns: [], rows: [] };
    const parsed = parseOCRContent(editedContent);
    if (!parsed) return { columns: [], rows: [] };
    return {
      columns: parsed.table.columns || [],
      rows: parsed.table.rows || [],
    };
  }, [editedContent]);

  // Apply structured data from AI to the table
  const handleApplyData = useCallback((type: string, data: any) => {
    console.log("Apply data:", type, data);
    
    if (!editedContent || type === "none") return;
    
    const parsed = parseOCRContent(editedContent);
    if (!parsed) return;

    // Update table based on type
    if (type === "columns" && Array.isArray(data)) {
      // Merge new columns, skip duplicates by group+label
      data.forEach((col: any) => {
        const exists = parsed.table.columns.some(
          c => c.group === (col.group || "") && c.label === (col.label || "")
        );
        if (!exists) {
          parsed.table.columns.push({
            group: col.group || "",
            label: col.label || "",
          });
        }
      });
    } else if (type === "rows" && Array.isArray(data)) {
      // Merge new rows, update existing or add new
      data.forEach((row: any) => {
        const existingIndex = parsed.table.rows.findIndex(
          r => r.category === (row.category || "") && r.row_label === (row.row_label || "")
        );
        if (existingIndex >= 0) {
          // Update existing row's values if provided
          if (row.values && row.values.length > 0) {
            parsed.table.rows[existingIndex].values = row.values;
          }
        } else {
          // Add new row
          parsed.table.rows.push({
            category: row.category || "",
            row_label: row.row_label || "",
            values: row.values || [],
          });
        }
      });
    } else if (type === "values" && Array.isArray(data)) {
      // Update values in existing rows
      data.forEach((update: any) => {
        const rowIndex = parsed.table.rows.findIndex(
          r => r.category === update.category && r.row_label === update.row_label
        );
        if (rowIndex >= 0 && update.values) {
          parsed.table.rows[rowIndex].values = update.values;
        }
      });
    }

    // Update the content
    setEditedContent(stringifyOCRContent(parsed));
  }, [editedContent]);

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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center px-4 shrink-0">
        <h1 className="text-lg font-semibold">Layout Test - {page.filename} (sida {page.page_number})</h1>
      </div>

      {/* Main content - horizontal split */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left panel: Image + Table editor */}
        <ResizablePanel defaultSize={65} minSize={40}>
          <div 
            ref={containerRef}
            className="h-full flex flex-col"
            onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Top: Image viewer */}
            <div 
              className="overflow-auto bg-muted/20"
              style={{ height: `${topHeight}%` }}
            >
              <OCRImageViewer 
                imageUrl={page.image_url} 
                filename={page.filename} 
              />
            </div>

            {/* Vertical resize handle */}
            <div 
              className="h-2 bg-border hover:bg-primary/50 cursor-row-resize shrink-0 flex items-center justify-center transition-colors"
              onMouseDown={handleMouseDown}
            >
              <div className="w-12 h-1 bg-muted-foreground/30 rounded" />
            </div>

            <div className="flex-1 min-h-0 overflow-auto bg-card/50">
              <OCRTextEditor
                content={editedContent || ""}
                pageId={page.id}
                onSave={(data) => {
                  console.log("Save:", data);
                  setEditedContent(data.content);
                }}
                isSaving={false}
              />
            </div>
          </div>
        </ResizablePanel>

        {/* Horizontal resize handle */}
        <ResizableHandle withHandle />

        {/* Right panel: Chat */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <TableBuilderChat
            imageUrl={page.image_url}
            pageId={page.id}
            currentTable={getCurrentTable()}
            onApplyData={handleApplyData}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
