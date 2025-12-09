import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentUploadZone } from "@/components/documents/DocumentUploadZone";
import { UploadPreview } from "@/components/documents/UploadPreview";
import { DocumentPreviewPanel } from "@/components/documents/DocumentPreviewPanel";
import { CategoryTree } from "@/components/documents/CategoryTree";
import { CategoryBreadcrumb } from "@/components/documents/CategoryBreadcrumb";
import { dummyDocuments } from "@/lib/dummyDocuments";
import {
  Document,
  StagedFile,
  DocumentStatus,
  generateTitleFromFilename,
  parseCategories,
  getUniqueExtensions,
} from "@/lib/documentTypes";
import { SortField, SortDirection } from "@/components/documents/SortDropdown";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Documents() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState<Document[]>(dummyDocuments);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileCategoryDrawerOpen, setMobileCategoryDrawerOpen] = useState(false);

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [extensionFilter, setExtensionFilter] = useState<string | "all">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Upload state
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);

  // Confirmation dialogs
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [rollbackConfirm, setRollbackConfirm] = useState<{
    docId: string;
    versionId: string;
  } | null>(null);

  const selectedDocument = useMemo(
    () => documents.find((d) => d.id === selectedDocumentId) || null,
    [documents, selectedDocumentId]
  );

  const categories = useMemo(() => parseCategories(documents), [documents]);
  const extensions = useMemo(() => getUniqueExtensions(documents), [documents]);
  const uncategorizedCount = useMemo(
    () => documents.filter((d) => !d.category).length,
    [documents]
  );

  const handleSelectDocument = (id: string) => {
    setSelectedDocumentId(id);
    // Only open drawer on mobile
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setExtensionFilter("all");
    setShowDeleted(false);
    setSelectedCategory(null); // Reset to "Alla dokument"
  };

  // Category management
  const handleCreateCategory = (parentPath: string | null, name: string) => {
    const newPath = parentPath ? `${parentPath}/${name}` : name;
    // Create a placeholder document to establish the category
    // In a real app, categories would be stored separately
    // For now, we just need to ensure the category path exists
    // The category will appear when documents are assigned to it
    toast({
      title: "Mapp skapad",
      description: `Mappen "${name}" har skapats${parentPath ? ` under "${parentPath.split('/').pop()}"` : ""}.`,
    });
    // Select the new category
    setSelectedCategory(newPath);
  };

  const handleRenameCategory = (oldPath: string, newName: string) => {
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');
    
    // Update all documents that have this category or are in subcategories
    setDocuments((prev) =>
      prev.map((doc) => {
        if (!doc.category) return doc;
        if (doc.category === oldPath) {
          return { ...doc, category: newPath };
        }
        if (doc.category.startsWith(oldPath + '/')) {
          return { ...doc, category: doc.category.replace(oldPath, newPath) };
        }
        return doc;
      })
    );
    
    // Update selected category if it was the renamed one
    if (selectedCategory === oldPath) {
      setSelectedCategory(newPath);
    } else if (selectedCategory?.startsWith(oldPath + '/')) {
      setSelectedCategory(selectedCategory.replace(oldPath, newPath));
    }
    
    toast({ title: "Mapp omdöpt", description: `Mappen heter nu "${newName}".` });
  };

  const handleDeleteCategory = (path: string) => {
    // Remove category from all documents in this category and subcategories
    setDocuments((prev) =>
      prev.map((doc) => {
        if (!doc.category) return doc;
        if (doc.category === path || doc.category.startsWith(path + '/')) {
          return { ...doc, category: undefined };
        }
        return doc;
      })
    );
    
    // Clear selected category if it was the deleted one
    if (selectedCategory === path || selectedCategory?.startsWith(path + '/')) {
      setSelectedCategory(null);
    }
    
    toast({
      title: "Mapp borttagen",
      description: "Filerna i mappen är nu okategoriserade.",
    });
  };

  const handleFilesSelected = (files: File[]) => {
    const staged: StagedFile[] = files.map((file) => {
      const existingDoc = documents.find(
        (d) => d.filename.toLowerCase() === file.name.toLowerCase()
      );

      return {
        file,
        title: generateTitleFromFilename(file.name),
        category: selectedCategory && selectedCategory !== "__uncategorized__" 
          ? selectedCategory 
          : undefined,
        isReplacement: !!existingDoc,
        existingDocumentId: existingDoc?.id,
      };
    });

    setStagedFiles(staged);
  };

  const handleUpdateStagedTitle = (index: number, title: string) => {
    setStagedFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, title } : f))
    );
  };

  const handleUpdateStagedCategory = (index: number, category: string | undefined) => {
    setStagedFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, category } : f))
    );
  };

  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmUpload = () => {
    // Simulate upload
    const now = new Date();

    stagedFiles.forEach((staged) => {
      if (staged.isReplacement && staged.existingDocumentId) {
        // Update existing document
        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id === staged.existingDocumentId) {
              const newVersion = {
                id: `v-${Date.now()}-${Math.random()}`,
                filename: staged.file.name,
                uploadedAt: now,
                status: "pending" as DocumentStatus,
              };

              // Mark current version as inactive
              const updatedVersions = doc.versions.map((v) =>
                v.id === doc.currentVersion.id
                  ? { ...v, status: "inactive" as DocumentStatus }
                  : v
              );

              return {
                ...doc,
                title: staged.title,
                category: staged.category,
                currentVersion: newVersion,
                versions: [newVersion, ...updatedVersions],
              };
            }
            return doc;
          })
        );
      } else {
        // Add new document
        const newVersion = {
          id: `v-${Date.now()}-${Math.random()}`,
          filename: staged.file.name,
          uploadedAt: now,
          status: "pending" as DocumentStatus,
        };

        const newDoc: Document = {
          id: `doc-${Date.now()}-${Math.random()}`,
          title: staged.title,
          filename: staged.file.name,
          category: staged.category,
          currentVersion: newVersion,
          versions: [newVersion],
          createdAt: now,
        };

        setDocuments((prev) => [newDoc, ...prev]);
      }
    });

    toast({
      title: "Uppladdning klar",
      description: `${stagedFiles.length} fil${
        stagedFiles.length !== 1 ? "er" : ""
      } har laddats upp och väntar på behandling.`,
    });

    setStagedFiles([]);
  };

  const handleDocumentCategoryChange = (docId: string, category: string | undefined) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, category: category || undefined } : doc
      )
    );
    toast({ title: "Kategori uppdaterad" });
  };

  const handleActivate = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              currentVersion: { ...doc.currentVersion, status: "active" },
              versions: doc.versions.map((v) =>
                v.id === doc.currentVersion.id ? { ...v, status: "active" } : v
              ),
            }
          : doc
      )
    );
    toast({ title: "Dokument aktiverat" });
  };

  const handleDeactivate = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              currentVersion: { ...doc.currentVersion, status: "inactive" },
              versions: doc.versions.map((v) =>
                v.id === doc.currentVersion.id ? { ...v, status: "inactive" } : v
              ),
            }
          : doc
      )
    );
    toast({ title: "Dokument inaktiverat" });
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              currentVersion: { ...doc.currentVersion, status: "deleted" },
              versions: doc.versions.map((v) =>
                v.id === doc.currentVersion.id ? { ...v, status: "deleted" } : v
              ),
            }
          : doc
      )
    );
    setDeleteConfirm(null);
    toast({
      title: "Dokument raderat",
      description: "Dokumentet kan återställas från listan.",
    });
  };

  const handleRollback = (docId: string, versionId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;

        const targetVersionIndex = doc.versions.findIndex(
          (v) => v.id === versionId
        );
        if (targetVersionIndex === -1) return doc;

        // Mark all versions before target as inactive
        const updatedVersions = doc.versions.map((v, i) => ({
          ...v,
          status: i < targetVersionIndex ? ("inactive" as DocumentStatus) : v.status,
        }));

        // Set target as active
        updatedVersions[targetVersionIndex] = {
          ...updatedVersions[targetVersionIndex],
          status: "active",
        };

        return {
          ...doc,
          currentVersion: updatedVersions[targetVersionIndex],
          versions: updatedVersions,
        };
      })
    );

    setRollbackConfirm(null);
    toast({
      title: "Version återställd",
      description: "Nyare versioner har markerats som inaktiva.",
    });
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop layout with resizable panels */}
      <div className="hidden lg:flex flex-1">
        <ResizablePanelGroup direction="horizontal">
          {/* Left: Category tree - Resizable */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <aside className="h-full bg-card border-r border-border flex flex-col">
              <CategoryTree
                categories={categories}
                documents={documents}
                selectedCategory={selectedCategory}
                selectedDocumentId={selectedDocumentId}
                onSelectCategory={setSelectedCategory}
                onSelectDocument={handleSelectDocument}
                onCreateCategory={handleCreateCategory}
                onRenameCategory={handleRenameCategory}
                onDeleteCategory={handleDeleteCategory}
                totalCount={documents.length}
                uncategorizedCount={uncategorizedCount}
              />
            </aside>
          </ResizablePanel>
          
          <ResizableHandle withHandle />

          {/* Center: Document list and upload */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <main className="h-full flex flex-col min-w-0">
              <PageHeader
                title="Dokumenthantering"
                subtitle="Hantera chatbotens kunskapsbas"
                icon={<FileText className="w-5 h-5 text-primary" />}
              />

              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Upload zone */}
                <div className="p-4 border-b border-border">
                  {stagedFiles.length > 0 ? (
                    <UploadPreview
                      stagedFiles={stagedFiles}
                      categories={categories}
                      onUpdateTitle={handleUpdateStagedTitle}
                      onUpdateCategory={handleUpdateStagedCategory}
                      onRemoveFile={handleRemoveStagedFile}
                      onConfirmUpload={handleConfirmUpload}
                      onCancel={() => setStagedFiles([])}
                    />
                  ) : (
                    <DocumentUploadZone onFilesSelected={handleFilesSelected} />
                  )}
                </div>

                {/* Document list */}
                <div className="flex-1 overflow-hidden">
                  <DocumentList
                    documents={documents}
                    selectedId={selectedDocumentId}
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    extensionFilter={extensionFilter}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    selectedCategory={selectedCategory}
                    extensions={extensions}
                    showDeleted={showDeleted}
                    onSelectDocument={handleSelectDocument}
                    onSearchChange={setSearchQuery}
                    onStatusFilterChange={setStatusFilter}
                    onExtensionFilterChange={setExtensionFilter}
                    onSortChange={(field, dir) => {
                      setSortField(field);
                      setSortDirection(dir);
                    }}
                    onCategoryChange={setSelectedCategory}
                    onShowDeletedChange={setShowDeleted}
                    onClearFilters={handleClearFilters}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                    onDelete={(id) => setDeleteConfirm(id)}
                  />
                </div>
              </div>
            </main>
          </ResizablePanel>
          
          <ResizableHandle withHandle />

          {/* Right: Preview panel - Desktop */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
            <aside className="h-full bg-panel border-l border-sidebar-border flex flex-col">
              <DocumentPreviewPanel
                document={selectedDocument}
                categories={categories}
                onRollback={(docId, versionId) =>
                  setRollbackConfirm({ docId, versionId })
                }
                onCategoryChange={handleDocumentCategoryChange}
              />
            </aside>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex-1 flex flex-col">
        <main className="flex-1 flex flex-col min-w-0">
          <PageHeader
            title="Dokumenthantering"
            subtitle="Hantera chatbotens kunskapsbas"
            icon={<FileText className="w-5 h-5 text-primary" />}
          />

          {/* Category breadcrumb trigger for mobile */}
          <div className="px-4 py-2 border-b border-border bg-card">
            <CategoryBreadcrumb
              category={selectedCategory}
              onNavigate={setSelectedCategory}
              compact
              onClick={() => setMobileCategoryDrawerOpen(true)}
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Upload zone */}
            <div className="p-4 border-b border-border">
              {stagedFiles.length > 0 ? (
                <UploadPreview
                  stagedFiles={stagedFiles}
                  categories={categories}
                  onUpdateTitle={handleUpdateStagedTitle}
                  onUpdateCategory={handleUpdateStagedCategory}
                  onRemoveFile={handleRemoveStagedFile}
                  onConfirmUpload={handleConfirmUpload}
                  onCancel={() => setStagedFiles([])}
                />
              ) : (
                <DocumentUploadZone onFilesSelected={handleFilesSelected} />
              )}
            </div>

            {/* Document list */}
            <div className="flex-1 overflow-hidden">
              <DocumentList
                documents={documents}
                selectedId={selectedDocumentId}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                extensionFilter={extensionFilter}
                sortField={sortField}
                sortDirection={sortDirection}
                selectedCategory={selectedCategory}
                extensions={extensions}
                showDeleted={showDeleted}
                onSelectDocument={handleSelectDocument}
                onSearchChange={setSearchQuery}
                onStatusFilterChange={setStatusFilter}
                onExtensionFilterChange={setExtensionFilter}
                onSortChange={(field, dir) => {
                  setSortField(field);
                  setSortDirection(dir);
                }}
                onCategoryChange={setSelectedCategory}
                onShowDeletedChange={setShowDeleted}
                onClearFilters={handleClearFilters}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile: Category Tree Drawer */}
      <Sheet open={mobileCategoryDrawerOpen} onOpenChange={setMobileCategoryDrawerOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[320px] bg-card border-r border-border p-0 lg:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Kategorier</SheetTitle>
          </SheetHeader>
          <CategoryTree
            categories={categories}
            documents={documents}
            selectedCategory={selectedCategory}
            selectedDocumentId={selectedDocumentId}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setMobileCategoryDrawerOpen(false);
            }}
            onSelectDocument={(id) => {
              handleSelectDocument(id);
              setMobileCategoryDrawerOpen(false);
            }}
            onCreateCategory={handleCreateCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
            totalCount={documents.length}
            uncategorizedCount={uncategorizedCount}
          />
        </SheetContent>
      </Sheet>

      {/* Mobile: Preview Drawer */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] bg-panel border-t border-sidebar-border p-0 lg:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Dokumentdetaljer</SheetTitle>
          </SheetHeader>
          <DocumentPreviewPanel
            document={selectedDocument}
            categories={categories}
            onRollback={(docId, versionId) =>
              setRollbackConfirm({ docId, versionId })
            }
            onCategoryChange={handleDocumentCategoryChange}
          />
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Radera dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokumentet markeras som raderat och exkluderas från chatbotens
              kunskapsbas. Du kan återställa det senare om det behövs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Radera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rollback confirmation */}
      <AlertDialog
        open={!!rollbackConfirm}
        onOpenChange={() => setRollbackConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Återställ tidigare version?</AlertDialogTitle>
            <AlertDialogDescription>
              Den valda versionen blir aktiv och alla nyare versioner markeras
              som inaktiva. Du kan återställa till en annan version när som
              helst.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                rollbackConfirm &&
                handleRollback(rollbackConfirm.docId, rollbackConfirm.versionId)
              }
            >
              Återställ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
