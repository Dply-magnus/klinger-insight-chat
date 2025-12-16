import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";

interface OCRTextEditorProps {
  content: string | null;
  pageId: string;
  onSave: (data: { id: string; content: string }) => void;
  isSaving: boolean;
}

export function OCRTextEditor({ content, pageId, onSave, isSaving }: OCRTextEditorProps) {
  const [editedContent, setEditedContent] = useState(content || "");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedContent(content || "");
    setHasChanges(false);
  }, [content, pageId]);

  const handleChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(value !== (content || ""));
  };

  const handleSave = () => {
    onSave({ id: pageId, content: editedContent });
    setHasChanges(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border/50 bg-card/50">
        <span className="text-sm font-medium text-foreground">OCR-text</span>
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Spara ändringar
        </Button>
      </div>

      {/* Text editor */}
      <div className="flex-1 p-4">
        <Textarea
          value={editedContent}
          onChange={(e) => handleChange(e.target.value)}
          className="h-full min-h-[400px] resize-none font-mono text-sm bg-background/50 border-border/50"
          placeholder="Ingen OCR-text tillgänglig..."
        />
      </div>

      {/* Status indicator */}
      {hasChanges && (
        <div className="px-4 pb-2">
          <p className="text-xs text-amber-500">Osparade ändringar</p>
        </div>
      )}
    </div>
  );
}
