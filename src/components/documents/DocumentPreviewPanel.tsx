import { FileText, Calendar, Layers, Folder, Download } from "lucide-react";
import { Document, formatDate, CategoryNode } from "@/lib/documentTypes";
import { getStoragePublicUrl } from "@/lib/storageUtils";
import { StatusBadge } from "./StatusBadge";
import { VersionHistory } from "./VersionHistory";
import { CategorySelect } from "./CategorySelect";

interface DocumentPreviewPanelProps {
  document: Document | null;
  categories: CategoryNode[];
  onRollback: (documentId: string, versionId: string) => void;
  onCategoryChange?: (documentId: string, category: string | undefined) => void;
}

export function DocumentPreviewPanel({
  document,
  categories,
  onRollback,
  onCategoryChange,
}: DocumentPreviewPanelProps) {
  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-panel-muted p-8">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm text-center">
          Välj ett dokument i listan för att se detaljer och versionshistorik
        </p>
      </div>
    );
  }

  const downloadUrl = document.storagePath
    ? getStoragePublicUrl('uploads', document.storagePath)
    : null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-panel-foreground truncate">
              {document.title}
            </h2>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5 truncate"
              >
                <Download className="w-3 h-3 flex-shrink-0" />
                {document.filename}
              </a>
            ) : (
              <p className="text-sm text-panel-muted truncate mt-0.5">
                {document.filename}
              </p>
            )}
            <div className="mt-2">
              <StatusBadge status={document.currentVersion.status} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-2 text-sm text-panel-muted">
          <Folder className="w-4 h-4" />
          <span>Kategori</span>
        </div>
        {onCategoryChange ? (
          <CategorySelect
            value={document.category}
            categories={categories}
            onChange={(cat) => onCategoryChange(document.id, cat)}
          />
        ) : (
          <p className="text-sm text-panel-foreground">
            {document.category || "Ingen kategori"}
          </p>
        )}
      </div>

      {/* Meta info */}
      <div className="p-4 border-b border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-panel-muted" />
          <span className="text-panel-muted">Uppladdad:</span>
          <span className="text-panel-foreground">
            {formatDate(document.currentVersion.uploadedAt)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Layers className="w-4 h-4 text-panel-muted" />
          <span className="text-panel-muted">Versioner:</span>
          <span className="text-panel-foreground">
            {document.versions.length}
          </span>
        </div>
      </div>

      {/* Version history */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <VersionHistory
          document={document}
          onRollback={(versionId) => onRollback(document.id, versionId)}
        />
      </div>
    </div>
  );
}
