import { useState, useCallback } from "react";
import { Upload, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export function DocumentUploadZone({ onFilesSelected }: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input
    e.target.value = "";
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all text-center",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <input
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
          isDragging ? "bg-primary/20" : "bg-muted"
        )}>
          {isDragging ? (
            <FileUp className="w-7 h-7 text-primary" />
          ) : (
            <Upload className="w-7 h-7 text-muted-foreground" />
          )}
        </div>
        
        <div>
          <p className="font-medium text-foreground">
            {isDragging ? "Släpp för att ladda upp" : "Dra och släpp PDF-filer här"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            eller klicka för att välja filer
          </p>
        </div>
      </div>
    </div>
  );
}
