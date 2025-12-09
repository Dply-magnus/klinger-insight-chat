import { FileText, MoreVertical, Eye, RotateCcw, Trash2, Power, PowerOff } from "lucide-react";
import { Document, formatDate } from "@/lib/documentTypes";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentRowProps {
  document: Document;
  isSelected: boolean;
  onClick: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onViewVersions: () => void;
}

export function DocumentRow({
  document,
  isSelected,
  onClick,
  onActivate,
  onDeactivate,
  onDelete,
  onViewVersions,
}: DocumentRowProps) {
  const { title, filename, currentVersion } = document;
  const status = currentVersion.status;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-4 p-4 border-b border-border cursor-pointer transition-colors",
        isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/50"
      )}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span className="truncate">{filename}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline whitespace-nowrap">{formatDate(currentVersion.uploadedAt)}</span>
        </div>
        {document.versions.length > 1 && (
          <div className="mt-1">
            <span className="text-xs text-muted-foreground">
              {document.versions.length} versioner
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onViewVersions} className="gap-2">
            <Eye className="w-4 h-4" />
            Visa versioner
          </DropdownMenuItem>
          
          {document.versions.length > 1 && (
            <DropdownMenuItem onClick={onViewVersions} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Återställ tidigare version
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {status === "inactive" || status === "deleted" ? (
            <DropdownMenuItem onClick={onActivate} className="gap-2 text-green-600">
              <Power className="w-4 h-4" />
              Aktivera
            </DropdownMenuItem>
          ) : status === "active" && (
            <DropdownMenuItem onClick={onDeactivate} className="gap-2">
              <PowerOff className="w-4 h-4" />
              Inaktivera
            </DropdownMenuItem>
          )}
          
          {status !== "deleted" && (
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              Radera
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
