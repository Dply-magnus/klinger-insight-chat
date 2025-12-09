import { useMemo } from "react";
import { Document, DocumentStatus } from "@/lib/documentTypes";
import { DocumentSearch } from "./DocumentSearch";
import { StatusFilter } from "./StatusFilter";
import { SortDropdown, SortField, SortDirection } from "./SortDropdown";
import { DocumentRow } from "./DocumentRow";
import { FileText } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  selectedId: string | null;
  searchQuery: string;
  statusFilter: DocumentStatus | "all";
  sortField: SortField;
  sortDirection: SortDirection;
  onSelectDocument: (id: string) => void;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: DocumentStatus | "all") => void;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentList({
  documents,
  selectedId,
  searchQuery,
  statusFilter,
  sortField,
  sortDirection,
  onSelectDocument,
  onSearchChange,
  onStatusFilterChange,
  onSortChange,
  onActivate,
  onDeactivate,
  onDelete,
}: DocumentListProps) {
  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.filename.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((doc) => doc.currentVersion.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "date":
          comparison = a.currentVersion.uploadedAt.getTime() - b.currentVersion.uploadedAt.getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title, "sv");
          break;
        case "filename":
          comparison = a.filename.localeCompare(b.filename, "sv");
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [documents, searchQuery, statusFilter, sortField, sortDirection]);

  // Count by status
  const counts = useMemo(() => {
    const counts: Record<DocumentStatus | "all", number> = {
      all: documents.length,
      active: 0,
      pending: 0,
      inactive: 0,
      deleted: 0,
    };

    documents.forEach((doc) => {
      counts[doc.currentVersion.status]++;
    });

    return counts;
  }, [documents]);

  return (
    <div className="flex flex-col h-full">
      {/* Search and controls */}
      <div className="p-4 space-y-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <DocumentSearch
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>
          <SortDropdown
            field={sortField}
            direction={sortDirection}
            onChange={onSortChange}
          />
        </div>
        
        <StatusFilter
          selected={statusFilter}
          onChange={onStatusFilterChange}
          counts={counts}
        />
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Inga dokument matchar sökningen"
                : "Inga dokument uppladdade ännu"}
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              isSelected={doc.id === selectedId}
              onClick={() => onSelectDocument(doc.id)}
              onActivate={() => onActivate(doc.id)}
              onDeactivate={() => onDeactivate(doc.id)}
              onDelete={() => onDelete(doc.id)}
              onViewVersions={() => onSelectDocument(doc.id)}
            />
          ))
        )}
      </div>

      {/* Results count */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Visar {filteredDocuments.length} av {documents.length} dokument
        </p>
      </div>
    </div>
  );
}
