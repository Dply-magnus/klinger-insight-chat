import { RotateCcw, CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react";
import { Document, DocumentVersion, formatDate } from "@/lib/documentTypes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VersionHistoryProps {
  document: Document;
  onRollback: (versionId: string) => void;
}

const statusIcons = {
  active: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  pending: <Clock className="w-4 h-4 text-yellow-600" />,
  inactive: <XCircle className="w-4 h-4 text-muted-foreground" />,
  deleted: <Trash2 className="w-4 h-4 text-destructive" />,
};

export function VersionHistory({ document, onRollback }: VersionHistoryProps) {
  const currentVersionId = document.currentVersion.id;

  return (
    <div className="p-4">
      <h3 className="font-medium text-panel-foreground mb-4">Versionshistorik</h3>
      
      <div className="space-y-0">
        {document.versions.map((version, index) => {
          const isCurrent = version.id === currentVersionId;
          const isLast = index === document.versions.length - 1;
          
          return (
            <div key={version.id} className="relative flex gap-3">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-[11px] top-8 w-0.5 h-[calc(100%-16px)] bg-sidebar-border" />
              )}
              
              {/* Timeline dot */}
              <div
                className={cn(
                  "relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  isCurrent ? "bg-primary" : "bg-sidebar-accent"
                )}
              >
                {statusIcons[version.status]}
              </div>
              
              {/* Content */}
              <div className={cn(
                "flex-1 pb-4 min-w-0",
                !isLast && "border-b border-sidebar-border mb-4"
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-panel-foreground" : "text-panel-muted"
                      )}>
                        {formatDate(version.uploadedAt)}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Nuvarande
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-panel-muted mt-0.5 truncate">
                      {version.filename}
                    </p>
                  </div>
                  
                  {!isCurrent && version.status !== "deleted" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRollback(version.id)}
                      className="text-panel-muted hover:text-panel-foreground hover:bg-sidebar-accent h-7 px-2"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      <span className="text-xs">Återställ</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {document.versions.length > 1 && (
        <div className="mt-4 p-3 bg-sidebar-accent/50 rounded-lg border border-sidebar-border">
          <p className="text-xs text-panel-muted">
            <strong className="text-panel-foreground">Tips:</strong> När du återställer 
            en tidigare version markeras alla nyare versioner som inaktiva.
          </p>
        </div>
      )}
    </div>
  );
}
