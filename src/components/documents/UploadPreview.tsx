import { useState } from "react";
import { FileText, X, AlertTriangle, Plus, RefreshCw, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StagedFile, generateTitleFromFilename } from "@/lib/documentTypes";
import { cn } from "@/lib/utils";

interface UploadPreviewProps {
  stagedFiles: StagedFile[];
  onUpdateTitle: (index: number, title: string) => void;
  onRemoveFile: (index: number) => void;
  onConfirmUpload: () => void;
  onCancel: () => void;
}

export function UploadPreview({
  stagedFiles,
  onUpdateTitle,
  onRemoveFile,
  onConfirmUpload,
  onCancel,
}: UploadPreviewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const newFiles = stagedFiles.filter((f) => !f.isReplacement);
  const replacements = stagedFiles.filter((f) => f.isReplacement);

  if (stagedFiles.length === 0) return null;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <h3 className="font-medium text-foreground">Granska uppladdning</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {stagedFiles.length} fil{stagedFiles.length !== 1 && "er"} valda
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {/* New files section */}
        {newFiles.length > 0 && (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Nya dokument ({newFiles.length})
              </span>
            </div>
            {newFiles.map((staged, idx) => {
              const originalIndex = stagedFiles.indexOf(staged);
              return (
                <FileItem
                  key={idx}
                  staged={staged}
                  index={originalIndex}
                  isEditing={editingIndex === originalIndex}
                  onEdit={() => setEditingIndex(originalIndex)}
                  onSaveEdit={() => setEditingIndex(null)}
                  onUpdateTitle={onUpdateTitle}
                  onRemove={onRemoveFile}
                />
              );
            })}
          </div>
        )}

        {/* Replacements section */}
        {replacements.length > 0 && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">
                Ersätter befintliga ({replacements.length})
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 mb-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-600">
                Dessa filer har samma namn som befintliga dokument och kommer ersätta dem.
                Tidigare versioner sparas och kan återställas.
              </p>
            </div>
            {replacements.map((staged, idx) => {
              const originalIndex = stagedFiles.indexOf(staged);
              return (
                <FileItem
                  key={idx}
                  staged={staged}
                  index={originalIndex}
                  isEditing={editingIndex === originalIndex}
                  onEdit={() => setEditingIndex(originalIndex)}
                  onSaveEdit={() => setEditingIndex(null)}
                  onUpdateTitle={onUpdateTitle}
                  onRemove={onRemoveFile}
                  isReplacement
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/30">
        <Button variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button onClick={onConfirmUpload}>
          <Check className="w-4 h-4 mr-2" />
          Ladda upp {stagedFiles.length} fil{stagedFiles.length !== 1 && "er"}
        </Button>
      </div>
    </div>
  );
}

interface FileItemProps {
  staged: StagedFile;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSaveEdit: () => void;
  onUpdateTitle: (index: number, title: string) => void;
  onRemove: (index: number) => void;
  isReplacement?: boolean;
}

function FileItem({
  staged,
  index,
  isEditing,
  onEdit,
  onSaveEdit,
  onUpdateTitle,
  onRemove,
  isReplacement,
}: FileItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border mb-2 last:mb-0",
        isReplacement ? "border-yellow-500/30 bg-yellow-500/5" : "border-border bg-background"
      )}
    >
      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={staged.title}
              onChange={(e) => onUpdateTitle(index, e.target.value)}
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && onSaveEdit()}
            />
            <Button size="sm" variant="ghost" onClick={onSaveEdit}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">
              {staged.title}
            </span>
            <button
              onClick={onEdit}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground truncate">{staged.file.name}</p>
      </div>

      <button
        onClick={() => onRemove(index)}
        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}
