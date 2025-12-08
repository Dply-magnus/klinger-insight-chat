import { cn } from "@/lib/utils";
import { FileText, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ImageData {
  id: string;
  url: string;
  title: string;
  page?: number;
}

interface ImagePanelProps {
  images: ImageData[];
  selectedMessageId?: string;
}

export function ImagePanel({ images, selectedMessageId }: ImagePanelProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-panel-muted p-8">
        <div className="w-16 h-16 rounded-2xl bg-panel-muted/10 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-center">
          Välj ett meddelande för att visa
          <br />
          tillhörande dokumentation
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="text-sm font-semibold text-panel-foreground">
          Relaterad dokumentation
        </h3>
        <p className="text-xs text-panel-muted mt-1">
          {images.length} {images.length === 1 ? "dokument" : "dokument"} • Klicka för att förstora
        </p>
      </div>

      {/* Main Image */}
      <div className="flex-1 p-4 overflow-hidden">
        <div 
          className="relative h-full bg-panel-foreground/5 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setExpandedImage(images[currentIndex].id)}
        >
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].title}
            className="w-full h-full object-contain p-2"
          />
          
          {/* Zoom overlay */}
          <div className="absolute inset-0 bg-panel/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="bg-panel-foreground/10 backdrop-blur-sm p-3 rounded-full">
              <ZoomIn className="w-6 h-6 text-panel-foreground" />
            </div>
          </div>

          {/* Page indicator */}
          {images[currentIndex].page && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-panel/80 backdrop-blur-sm rounded-md text-xs text-panel-foreground font-medium">
              Sida {images[currentIndex].page}
            </div>
          )}

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-panel/80 backdrop-blur-sm text-panel-foreground hover:bg-panel transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-panel/80 backdrop-blur-sm text-panel-foreground hover:bg-panel transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 pt-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  index === currentIndex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-sidebar-border/50 hover:border-panel-muted"
                )}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document title */}
      <div className="p-4 pt-0">
        <div className="bg-sidebar-accent/50 rounded-lg p-3">
          <p className="text-xs text-panel-muted">Dokument</p>
          <p className="text-sm font-medium text-panel-foreground mt-0.5 truncate">
            {images[currentIndex].title}
          </p>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-panel/95 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setExpandedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-panel-foreground/10 text-panel-foreground hover:bg-panel-foreground/20 transition-colors"
            onClick={() => setExpandedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={images.find(img => img.id === expandedImage)?.url}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
