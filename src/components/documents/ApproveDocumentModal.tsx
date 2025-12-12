import { Document, formatDate } from "@/lib/documentTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Send, Check, X } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface ApproveDocumentModalProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproveAndSend: () => void;
  onApproveOnly: () => void;
  onReject: () => void;
}

export function ApproveDocumentModal({
  document,
  open,
  onOpenChange,
  onApproveAndSend,
  onApproveOnly,
  onReject,
}: ApproveDocumentModalProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Granska dokument
          </DialogTitle>
          <DialogDescription>
            Godkänn eller avslå det uppladdade dokumentet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document info */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <h4 className="font-medium truncate">{document.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {document.filename}
                </p>
              </div>
              <StatusBadge status={document.currentVersion.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Kategori:</span>
                <p className="font-medium truncate">
                  {document.category || "Okategoriserad"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>
                <p className="font-medium">
                  {document.versions.length}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Uppladdad:</span>
                <p className="font-medium">
                  {formatDate(document.currentVersion.uploadedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onApproveAndSend}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4 mr-2" />
            Godkänn & skicka till n8n
          </Button>
          <Button
            variant="secondary"
            onClick={onApproveOnly}
            className="w-full"
          >
            <Check className="w-4 h-4 mr-2" />
            Endast aktivera
          </Button>
          <div className="flex gap-2 w-full">
            <Button
              variant="destructive"
              onClick={onReject}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Avslå
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Avbryt
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
