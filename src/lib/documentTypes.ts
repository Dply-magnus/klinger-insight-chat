export type DocumentStatus = "active" | "pending" | "inactive";

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
  category?: string; // Path-based: "Produkter/Ventiler/Kulventiler"
  currentVersion: DocumentVersion;
  versions: DocumentVersion[];
  createdAt: Date;
}

export interface StagedFile {
  file: File;
  title: string;
  category?: string;
  isReplacement: boolean;
  existingDocumentId?: string;
}

export interface CategoryNode {
  name: string;
  path: string;
  children: CategoryNode[];
  documentCount: number;
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

export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^/.]+)$/);
  return match ? match[1].toLowerCase() : "";
}

export function parseCategories(documents: Document[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();

  documents.forEach((doc) => {
    if (!doc.category) return;

    const segments = doc.category.split("/");
    let currentPath = "";

    segments.forEach((segment, index) => {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      if (!categoryMap.has(currentPath)) {
        categoryMap.set(currentPath, {
          name: segment,
          path: currentPath,
          children: [],
          documentCount: 0,
        });

        // Add to parent's children
        if (parentPath && categoryMap.has(parentPath)) {
          const parent = categoryMap.get(parentPath)!;
          if (!parent.children.find((c) => c.path === currentPath)) {
            parent.children.push(categoryMap.get(currentPath)!);
          }
        }
      }

      // Increment document count for this path and all parents
      if (index === segments.length - 1) {
        let path = currentPath;
        while (path) {
          const node = categoryMap.get(path);
          if (node) node.documentCount++;
          const lastSlash = path.lastIndexOf("/");
          path = lastSlash > 0 ? path.substring(0, lastSlash) : "";
        }
      }
    });
  });

  // Return only root-level categories
  return Array.from(categoryMap.values()).filter(
    (cat) => !cat.path.includes("/")
  );
}

export function getUniqueExtensions(documents: Document[]): string[] {
  const extensions = new Set<string>();
  documents.forEach((doc) => {
    const ext = getFileExtension(doc.filename);
    if (ext) extensions.add(ext);
  });
  return Array.from(extensions).sort();
}
