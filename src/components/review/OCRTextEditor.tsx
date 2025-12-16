import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { TableEditor } from "./TableEditor";
import { OCRJsonContent, parseOCRContent, stringifyOCRContent } from "@/lib/ocrTypes";

interface OCRTextEditorProps {
  content: string | null;
  pageId: string;
  onSave: (data: { id: string; content: string }) => void;
  isSaving: boolean;
}

export function OCRTextEditor({ content, pageId, onSave, isSaving }: OCRTextEditorProps) {
  const [jsonData, setJsonData] = useState<OCRJsonContent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const parsed = parseOCRContent(content);
    setJsonData(parsed);
    setHasChanges(false);
  }, [content, pageId]);

  const handlePageContextChange = (value: string) => {
    if (!jsonData) return;
    setJsonData({ ...jsonData, page_context: value });
    setHasChanges(true);
  };

  const handleTableChange = (
    columns: string[],
    rows: { row_label: string; values: (string | null)[] }[]
  ) => {
    if (!jsonData) return;
    setJsonData({
      ...jsonData,
      table: { ...jsonData.table, columns, rows }
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!jsonData) return;
    onSave({ id: pageId, content: stringifyOCRContent(jsonData) });
    setHasChanges(false);
  };

  if (!jsonData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 border-b border-border/50 bg-card/50">
          <span className="text-sm font-medium text-foreground">OCR-data</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Ingen OCR-data tillgänglig</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border/50 bg-card/50 gap-2">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          OCR-data (Sida {jsonData.meta.page_number})
        </span>
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
          Spara
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Page Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Sidkontext (rubriker, löptext)
            </label>
            <Textarea
              value={jsonData.page_context}
              onChange={(e) => handlePageContextChange(e.target.value)}
              className="min-h-[100px] resize-y font-mono text-sm bg-background/50 border-border/50 whitespace-pre-wrap break-words overflow-wrap-anywhere"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              placeholder="Ingen kontext..."
            />
          </div>

          {/* Table */}
          {jsonData.table.has_table && (
            <div className="space-y-2 overflow-hidden">
              <label className="text-sm font-medium text-foreground">
                Tabell ({jsonData.table.columns.length} kolumner, {jsonData.table.rows.length} rader)
              </label>
              <TableEditor
                columns={jsonData.table.columns}
                rows={jsonData.table.rows}
                legend={jsonData.legend}
                onChange={handleTableChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      {hasChanges && (
        <div className="px-4 py-2 border-t border-border/50">
          <p className="text-xs text-amber-500">Osparade ändringar</p>
        </div>
      )}
    </div>
  );
}
