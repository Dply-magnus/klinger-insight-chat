export type DocumentStatus = "active" | "pending" | "inactive" | "deleted";

export interface DocumentVersion {
  id: string;
  filename: string;
  uploadedAt: Date;
  status: DocumentStatus;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  currentVersion: DocumentVersion;
  versions: DocumentVersion[];
  createdAt: Date;
}

export interface StagedFile {
  file: File;
  title: string;
  isReplacement: boolean;
  existingDocumentId?: string;
}

export function generateTitleFromFilename(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  // Replace underscores and hyphens with spaces
  const withSpaces = nameWithoutExt.replace(/[-_]/g, " ");
  // Capitalize first letter
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/-/g, "") + " " + date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
