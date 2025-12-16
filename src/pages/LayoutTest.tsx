import { useState, useRef, useCallback } from "react";

export default function LayoutTest() {
  const [topHeight, setTopHeight] = useState(40); // percentage
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
          <div className="p-4">
            <p className="mb-2 text-sm text-muted-foreground">Övre panel - scrollbar bör synas:</p>
            {/* Large placeholder to test scrolling */}
            <div 
              className="bg-primary/20 border-2 border-dashed border-primary/50 rounded flex items-center justify-center"
              style={{ width: "1200px", height: "800px" }}
            >
              <span className="text-lg">Stor bild-placeholder (1200x800px)</span>
            </div>
          </div>
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
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">Nedre panel - scrollbar bör synas:</p>
            
            {/* Sidkontext textarea */}
            <div>
              <label className="text-sm font-medium mb-1 block">Sidkontext</label>
              <textarea 
                className="w-full h-32 p-2 border border-border rounded bg-background resize-none"
                defaultValue="Detta är sidkontext-texten som kan redigeras..."
              />
            </div>

            {/* Large table placeholder */}
            <div>
              <label className="text-sm font-medium mb-1 block">Tabell</label>
              <div 
                className="bg-secondary/30 border-2 border-dashed border-secondary rounded"
                style={{ width: "1000px", height: "600px" }}
              >
                <div className="p-4">
                  <p>Stor tabell-placeholder (1000x600px)</p>
                  <table className="mt-4 border-collapse">
                    <thead>
                      <tr>
                        {Array.from({ length: 15 }, (_, i) => (
                          <th key={i} className="border border-border p-2 bg-muted">
                            Kolumn {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 20 }, (_, rowIdx) => (
                        <tr key={rowIdx}>
                          {Array.from({ length: 15 }, (_, colIdx) => (
                            <td key={colIdx} className="border border-border p-2">
                              R{rowIdx + 1}K{colIdx + 1}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
