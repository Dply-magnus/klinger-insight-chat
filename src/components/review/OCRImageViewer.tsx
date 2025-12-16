import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface OCRImageViewerProps {
  imageUrl: string | null;
  filename: string | null;
}

export function OCRImageViewer({ imageUrl, filename }: OCRImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-32 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">Ingen bild tillgänglig</p>
      </div>
    );
  }

  return (
    <div>
      {/* Zoom controls - sticky */}
      <div className="flex items-center gap-2 p-2 border-b border-border/50 bg-card/50 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="h-8 w-8 p-0"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          className="h-8 w-8 p-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        {filename && (
          <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">
            {filename}
          </span>
        )}
      </div>

      {/* Image - no internal scroll, parent handles it */}
      <div className="p-4">
        <img
          src={imageUrl}
          alt={filename || "OCR-bild"}
          loading="lazy"
          decoding="async"
          className="rounded shadow-lg"
          style={{
            width: `${zoom * 100}%`,
            maxWidth: "none",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}
