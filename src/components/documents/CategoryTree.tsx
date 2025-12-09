import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, FileStack, HelpCircle, FileText, Plus, Pencil, Trash2, MoreHorizontal, FolderPlus } from "lucide-react";
import { CategoryNode, Document, getFileExtension } from "@/lib/documentTypes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryTreeProps {
  categories: CategoryNode[];
  documents: Document[];
  selectedCategory: string | null;
  selectedDocumentId: string | null;
  onSelectCategory: (path: string | null) => void;
  onSelectDocument: (id: string) => void;
  onCreateCategory: (parentPath: string | null, name: string) => void;
  onRenameCategory: (oldPath: string, newName: string) => void;
  onDeleteCategory: (path: string) => void;
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
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  totalCount,
  uncategorizedCount,
}: CategoryTreeProps) {
  // Get uncategorized documents
  const uncategorizedDocs = documents.filter((d) => !d.category);
  
  // State for creating new category
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      // Create under currently selected category (or root if none selected or __uncategorized__)
      const parentPath = selectedCategory === "__uncategorized__" ? null : selectedCategory;
      onCreateCategory(parentPath, newCategoryName.trim());
      setNewCategoryName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Kategorier & Filer
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsCreating(true)}
          title="Skapa ny mapp"
        >
          <FolderPlus className="w-4 h-4" />
        </Button>
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

        {/* New root category input */}
        {isCreating && (
          <div className="flex items-center gap-2 mt-2 mb-1 px-3">
            <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ny mapp..."
              className="h-7 text-xs flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCategory();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewCategoryName("");
                }
              }}
              onBlur={() => {
                if (!newCategoryName.trim()) {
                  setIsCreating(false);
                }
              }}
            />
            <Button 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}

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
            onCreateCategory={onCreateCategory}
            onRenameCategory={onRenameCategory}
            onDeleteCategory={onDeleteCategory}
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
  onCreateCategory: (parentPath: string | null, name: string) => void;
  onRenameCategory: (oldPath: string, newName: string) => void;
  onDeleteCategory: (path: string) => void;
  level: number;
}

function CategoryItem({
  category,
  documents,
  selectedCategory,
  selectedDocumentId,
  onSelectCategory,
  onSelectDocument,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  level,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    selectedCategory?.startsWith(category.path) || false
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(category.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingSubfolder, setIsAddingSubfolder] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  
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

  const handleRename = () => {
    if (renameValue.trim() && renameValue.trim() !== category.name) {
      onRenameCategory(category.path, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    onDeleteCategory(category.path);
    setShowDeleteConfirm(false);
  };

  const handleAddSubfolder = () => {
    if (newSubfolderName.trim()) {
      onCreateCategory(category.path, newSubfolderName.trim());
      setNewSubfolderName("");
      setIsAddingSubfolder(false);
      setIsExpanded(true);
    }
  };

  return (
    <>
      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Byt namn på mapp</DialogTitle>
            <DialogDescription>
              Ange ett nytt namn för mappen "{category.name}"
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Mappnamn..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenaming(false)}>
              Avbryt
            </Button>
            <Button onClick={handleRename}>Spara</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort mapp?</AlertDialogTitle>
            <AlertDialogDescription>
              Mappen "{category.name}" kommer att tas bort. Alla filer i mappen 
              {hasChildren ? " och dess undermappar" : ""} kommer att bli okategoriserade.
              Detta går inte att ångra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div>
        <div
          className={cn(
            "group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
            isSelected
              ? "bg-primary text-primary-foreground"
              : isParentOfSelected
              ? "text-foreground font-medium"
              : "text-foreground hover:bg-muted"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={handleClick}
        >
          {hasContent ? (
            <span
              role="button"
              onClick={handleToggle}
              className="p-0.5 -ml-1 hover:bg-muted rounded cursor-pointer"
            >
              <ChevronRight
                className={cn(
                  "w-3 h-3 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </span>
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
            "text-xs mr-1",
            isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {category.documentCount}
          </span>

          {/* Add subfolder button */}
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingSubfolder(true);
              setIsExpanded(true);
            }}
            className={cn(
              "p-1 rounded hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
              isSelected && "hover:bg-primary-foreground/20"
            )}
            title="Lägg till undermapp"
          >
            <Plus className="w-3 h-3" />
          </span>

          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span
                role="button"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "p-1 rounded hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                  isSelected && "hover:bg-primary-foreground/20"
                )}
              >
                <MoreHorizontal className="w-3 h-3" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem 
                onClick={() => {
                  setIsAddingSubfolder(true);
                  setIsExpanded(true);
                }} 
                className="gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Lägg till undermapp
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setRenameValue(category.name);
                  setIsRenaming(true);
                }} 
                className="gap-2"
              >
                <Pencil className="w-4 h-4" />
                Byt namn
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteConfirm(true)} 
                className="gap-2 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Ta bort
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Inline subfolder creation */}
        {isAddingSubfolder && (
          <div 
            className="flex items-center gap-2 mt-1 mb-1"
            style={{ paddingLeft: `${28 + level * 16}px` }}
          >
            <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              value={newSubfolderName}
              onChange={(e) => setNewSubfolderName(e.target.value)}
              placeholder="Mappnamn..."
              className="h-7 text-xs flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubfolder();
                if (e.key === "Escape") {
                  setIsAddingSubfolder(false);
                  setNewSubfolderName("");
                }
              }}
              onBlur={() => {
                if (!newSubfolderName.trim()) {
                  setIsAddingSubfolder(false);
                }
              }}
            />
            <Button 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleAddSubfolder}
              disabled={!newSubfolderName.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}

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
                onCreateCategory={onCreateCategory}
                onRenameCategory={onRenameCategory}
                onDeleteCategory={onDeleteCategory}
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
    </>
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
