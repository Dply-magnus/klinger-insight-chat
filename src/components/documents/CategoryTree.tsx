import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, FileStack, HelpCircle, FileText } from "lucide-react";
import { CategoryNode, Document, getFileExtension } from "@/lib/documentTypes";
import { cn } from "@/lib/utils";

interface CategoryTreeProps {
  categories: CategoryNode[];
  documents: Document[];
  selectedCategory: string | null;
  selectedDocumentId: string | null;
  onSelectCategory: (path: string | null) => void;
  onSelectDocument: (id: string) => void;
  totalCount: number;
  uncategorizedCount: number;
}

export function CategoryTree({
  categories,
  documents,
  selectedCategory,
  selectedDocumentId,
  onSelectCategory,
  onSelectDocument,
  totalCount,
  uncategorizedCount,
}: CategoryTreeProps) {
  // Get uncategorized documents
  const uncategorizedDocs = documents.filter((d) => !d.category);

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Kategorier & Filer
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {/* All documents */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          )}
        >
          <FileStack className="w-4 h-4" />
          <span className="flex-1 text-left">Alla dokument</span>
          <span className={cn(
            "text-xs",
            selectedCategory === null ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>{totalCount}</span>
        </button>

        {/* Category tree */}
        {categories.map((category) => (
          <CategoryItem
            key={category.path}
            category={category}
            documents={documents}
            selectedCategory={selectedCategory}
            selectedDocumentId={selectedDocumentId}
            onSelectCategory={onSelectCategory}
            onSelectDocument={onSelectDocument}
            level={0}
          />
        ))}

        {/* Uncategorized */}
        {uncategorizedCount > 0 && (
          <UncategorizedSection
            documents={uncategorizedDocs}
            selectedCategory={selectedCategory}
            selectedDocumentId={selectedDocumentId}
            onSelectCategory={onSelectCategory}
            onSelectDocument={onSelectDocument}
            count={uncategorizedCount}
          />
        )}
      </div>
    </div>
  );
}

interface UncategorizedSectionProps {
  documents: Document[];
  selectedCategory: string | null;
  selectedDocumentId: string | null;
  onSelectCategory: (path: string | null) => void;
  onSelectDocument: (id: string) => void;
  count: number;
}

function UncategorizedSection({
  documents,
  selectedCategory,
  selectedDocumentId,
  onSelectCategory,
  onSelectDocument,
  count,
}: UncategorizedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedCategory === "__uncategorized__";

  return (
    <div className="mt-2">
      <button
        onClick={() => {
          onSelectCategory("__uncategorized__");
          setIsExpanded(true);
        }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-0.5 -ml-1 hover:bg-muted rounded"
        >
          <ChevronRight
            className={cn(
              "w-3 h-3 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        </button>
        <HelpCircle className="w-4 h-4" />
        <span className="flex-1 text-left">Okategoriserade</span>
        <span className={cn(
          "text-xs",
          isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>{count}</span>
      </button>

      {isExpanded && (
        <div className="ml-4">
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              isSelected={selectedDocumentId === doc.id}
              onSelect={() => onSelectDocument(doc.id)}
              level={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryItemProps {
  category: CategoryNode;
  documents: Document[];
  selectedCategory: string | null;
  selectedDocumentId: string | null;
  onSelectCategory: (path: string | null) => void;
  onSelectDocument: (id: string) => void;
  level: number;
}

function CategoryItem({
  category,
  documents,
  selectedCategory,
  selectedDocumentId,
  onSelectCategory,
  onSelectDocument,
  level,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    selectedCategory?.startsWith(category.path) || false
  );
  const hasChildren = category.children.length > 0;
  const isSelected = selectedCategory === category.path;
  const isParentOfSelected = selectedCategory?.startsWith(category.path + "/") || false;

  // Get documents directly in this category (not in subcategories)
  const directDocuments = documents.filter(
    (doc) => doc.category === category.path
  );
  const hasContent = hasChildren || directDocuments.length > 0;

  const handleClick = () => {
    onSelectCategory(category.path);
    if (hasContent && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground"
            : isParentOfSelected
            ? "text-foreground font-medium"
            : "text-foreground hover:bg-muted"
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasContent ? (
          <button
            onClick={handleToggle}
            className="p-0.5 -ml-1 hover:bg-muted rounded"
          >
            <ChevronRight
              className={cn(
                "w-3 h-3 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="w-4" />
        )}
        
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-primary" />
        ) : (
          <Folder className={cn(
            "w-4 h-4",
            isSelected ? "text-primary-foreground" : "text-muted-foreground"
          )} />
        )}
        
        <span className="flex-1 text-left truncate">{category.name}</span>
        <span className={cn(
          "text-xs",
          isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {category.documentCount}
        </span>
      </button>

      {isExpanded && (
        <div>
          {/* Subcategories */}
          {category.children.map((child) => (
            <CategoryItem
              key={child.path}
              category={child}
              documents={documents}
              selectedCategory={selectedCategory}
              selectedDocumentId={selectedDocumentId}
              onSelectCategory={onSelectCategory}
              onSelectDocument={onSelectDocument}
              level={level + 1}
            />
          ))}
          
          {/* Documents directly in this category - same indentation as subcategories */}
          {directDocuments.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              isSelected={selectedDocumentId === doc.id}
              onSelect={() => onSelectDocument(doc.id)}
              level={level + 1}
              hasChevronSpace={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DocumentItemProps {
  document: Document;
  isSelected: boolean;
  onSelect: () => void;
  level: number;
  hasChevronSpace?: boolean;
}

function DocumentItem({ document, isSelected, onSelect, level, hasChevronSpace = false }: DocumentItemProps) {
  const ext = getFileExtension(document.filename).toUpperCase();
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "text-foreground/80 hover:bg-muted"
      )}
      style={{ paddingLeft: `${12 + level * 16}px` }}
    >
      {/* Add spacer to align with folder icons (chevron width) */}
      {hasChevronSpace && <span className="w-4 flex-shrink-0" />}
      <FileText className={cn(
        "w-4 h-4 flex-shrink-0",
        isSelected ? "text-accent-foreground" : "text-muted-foreground"
      )} />
      <span className="flex-1 text-left truncate text-xs">{document.title}</span>
      {ext && (
        <span className={cn(
          "text-[10px] px-1 py-0.5 rounded uppercase",
          isSelected ? "bg-accent-foreground/20" : "bg-muted text-muted-foreground"
        )}>
          {ext}
        </span>
      )}
    </button>
  );
}
