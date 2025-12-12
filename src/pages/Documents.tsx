import { useState, useMemo } from "react";
import { FileText, Loader2, LogIn, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentUploadZone } from "@/components/documents/DocumentUploadZone";
import { UploadPreview } from "@/components/documents/UploadPreview";
import { DocumentPreviewPanel } from "@/components/documents/DocumentPreviewPanel";
import { CategoryTree } from "@/components/documents/CategoryTree";
import { CategoryBreadcrumb } from "@/components/documents/CategoryBreadcrumb";
import { useKlingerDocuments } from "@/hooks/useKlingerDocuments";
import { useDocumentMutations } from "@/hooks/useDocumentMutations";
import { useKlingerCategories } from "@/hooks/useKlingerCategories";
import { useAuth } from "@/hooks/useAuth";
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
import { Button } from "@/components/ui/button";

export default function Documents() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, loading: authLoading } = useAuth();
  
  // Supabase data
  const { data: documents = [], isLoading, error } = useKlingerDocuments();
  const { data: storedCategories = [], isLoading: categoriesLoading } = useKlingerCategories();
  const { 
    uploadDocument, 
    replaceDocument, 
    updateStatus, 
    updateCategory, 
    rollbackVersion,
    deleteDocument,
    createCategory,
    deleteCategory: deleteCategoryMutation,
    renameCategory: renameCategoryMutation,
  } = useDocumentMutations();

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileCategoryDrawerOpen, setMobileCategoryDrawerOpen] = useState(false);

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [extensionFilter, setExtensionFilter] = useState<string | "all">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Upload state
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [showUploadZone, setShowUploadZone] = useState(false);

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

  const categories = useMemo(() => {
    const docCategories = parseCategories(documents);
    
    // Add stored categories from database
    storedCategories.forEach(storedCat => {
      const segments = storedCat.path.split("/");
      let currentLevel = docCategories;
      let currentPath = "";
      
      segments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        let existing = currentLevel.find(c => c.path === currentPath);
        
        if (!existing) {
          existing = {
            name: segment,
            path: currentPath,
            children: [],
            documentCount: 0,
          };
          currentLevel.push(existing);
        }
        currentLevel = existing.children;
      });
    });
    
    return docCategories;
  }, [documents, storedCategories]);
  const extensions = useMemo(() => getUniqueExtensions(documents), [documents]);
  const uncategorizedCount = useMemo(
    () => documents.filter((d) => !d.category).length,
    [documents]
  );

  const handleSelectDocument = (id: string) => {
    setSelectedDocumentId(id);
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setExtensionFilter("all");
    setSelectedCategory(null);
  };

  // Category management
  const handleCreateCategory = async (parentPath: string | null, name: string) => {
    if (!user) return;
    
    const newPath = parentPath ? `${parentPath}/${name}` : name;
    
    try {
      await createCategory.mutateAsync({
        path: newPath,
        name,
        userId: user.id,
      });
      
      toast({
        title: "Mapp skapad",
        description: `Mappen "${name}" har skapats${parentPath ? ` under "${parentPath.split('/').pop()}"` : ""}.`,
      });
      setSelectedCategory(newPath);
    } catch (error) {
      toast({
        title: "Kunde inte skapa mapp",
        variant: "destructive",
      });
    }
  };

  const handleRenameCategory = async (oldPath: string, newName: string) => {
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');

    // Update all documents that have this category or are in subcategories
    const docsToUpdate = documents.filter(doc => {
      if (!doc.category) return false;
      return doc.category === oldPath || doc.category.startsWith(oldPath + '/');
    });

    for (const doc of docsToUpdate) {
      const newCategory = doc.category === oldPath 
        ? newPath 
        : doc.category!.replace(oldPath, newPath);
      await updateCategory.mutateAsync({ documentId: doc.id, category: newCategory });
    }

    // Also update stored categories in database
    await renameCategoryMutation.mutateAsync({ oldPath, newPath });

    if (selectedCategory === oldPath) {
      setSelectedCategory(newPath);
    } else if (selectedCategory?.startsWith(oldPath + '/')) {
      setSelectedCategory(selectedCategory.replace(oldPath, newPath));
    }

    toast({ title: "Mapp omdöpt", description: `Mappen heter nu "${newName}".` });
  };

  const handleDeleteCategory = async (path: string) => {
    // Remove category from all documents in this category and subcategories
    const docsToUpdate = documents.filter(doc => {
      if (!doc.category) return false;
      return doc.category === path || doc.category.startsWith(path + '/');
    });

    for (const doc of docsToUpdate) {
      await updateCategory.mutateAsync({ documentId: doc.id, category: '' });
    }

    // Remove from database
    await deleteCategoryMutation.mutateAsync(path);

    if (selectedCategory === path || selectedCategory?.startsWith(path + '/')) {
      setSelectedCategory(null);
    }

    toast({
      title: "Mapp borttagen",
      description: "Filerna i mappen är nu okategoriserade.",
    });
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument.mutateAsync(documentId);
      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
      }
      toast({
        title: "Dokument borttaget",
        description: "Dokumentet har tagits bort permanent.",
      });
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort dokumentet.",
        variant: "destructive",
      });
    }
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

  const handleConfirmUpload = async () => {
    if (!user) {
      toast({
        title: "Ej inloggad",
        description: "Du måste vara inloggad för att ladda upp dokument.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const staged of stagedFiles) {
        if (staged.isReplacement && staged.existingDocumentId) {
          const existingDoc = documents.find(d => d.id === staged.existingDocumentId);
          if (existingDoc) {
            await replaceDocument.mutateAsync({
              documentId: staged.existingDocumentId,
              file: staged.file,
              title: staged.title,
              category: staged.category,
              userId: user.id,
              currentVersionId: existingDoc.currentVersion.id,
            });
          }
        } else {
          await uploadDocument.mutateAsync({
            file: staged.file,
            title: staged.title,
            category: staged.category,
            userId: user.id,
          });
        }
      }

      toast({
        title: "Uppladdning klar",
        description: `${stagedFiles.length} fil${stagedFiles.length !== 1 ? "er" : ""} har laddats upp.`,
      });
      setStagedFiles([]);
      setShowUploadZone(false);
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: "Uppladdning misslyckades",
        description: "Ett fel uppstod vid uppladdning.",
        variant: "destructive",
      });
    }
  };

  const handleDocumentCategoryChange = async (docId: string, category: string | undefined) => {
    try {
      await updateCategory.mutateAsync({ documentId: docId, category: category || '' });
      toast({ title: "Kategori uppdaterad" });
    } catch {
      toast({ title: "Kunde inte uppdatera kategori", variant: "destructive" });
    }
  };

  const handleActivate = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    try {
      await updateStatus.mutateAsync({
        documentId: id,
        versionId: doc.currentVersion.id,
        status: 'active',
      });
      toast({ title: "Dokument aktiverat" });
    } catch {
      toast({ title: "Kunde inte aktivera", variant: "destructive" });
    }
  };

  const handleDeactivate = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    try {
      await updateStatus.mutateAsync({
        documentId: id,
        versionId: doc.currentVersion.id,
        status: 'inactive',
      });
      toast({ title: "Dokument inaktiverat" });
    } catch {
      toast({ title: "Kunde inte inaktivera", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
      if (selectedDocumentId === id) {
        setSelectedDocumentId(null);
      }
      setDeleteConfirm(null);
      toast({
        title: "Dokument raderat",
        description: "Dokumentet har tagits bort permanent.",
      });
    } catch {
      toast({ title: "Kunde inte radera", variant: "destructive" });
    }
  };

  const handleRollback = async (docId: string, versionId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const targetVersionIndex = doc.versions.findIndex(v => v.id === versionId);
    if (targetVersionIndex === -1) return;

    // Get IDs of newer versions (those that come before in the sorted array)
    const newerVersionIds = doc.versions
      .slice(0, targetVersionIndex)
      .map(v => v.id);

    try {
      await rollbackVersion.mutateAsync({
        documentId: docId,
        targetVersionId: versionId,
        newerVersionIds,
      });
      setRollbackConfirm(null);
      toast({
        title: "Version återställd",
        description: "Nyare versioner har markerats som inaktiva.",
      });
    } catch {
      toast({ title: "Kunde inte återställa version", variant: "destructive" });
    }
  };

  // Loading state
  if (isLoading || authLoading || categoriesLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2">Ett fel uppstod vid hämtning av dokument</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const renderUploadZone = () => {
    if (!user) {
      return (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <LogIn className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">Logga in för att ladda upp dokument</p>
          <Button variant="outline" size="sm" asChild>
            <a href="/auth"><LogIn className="w-4 h-4 mr-1" />Logga in</a>
          </Button>
        </div>
      );
    }

    if (stagedFiles.length > 0) {
      return (
        <UploadPreview
          stagedFiles={stagedFiles}
          categories={categories}
          onUpdateTitle={handleUpdateStagedTitle}
          onUpdateCategory={handleUpdateStagedCategory}
          onRemoveFile={handleRemoveStagedFile}
          onConfirmUpload={handleConfirmUpload}
          onCancel={() => setStagedFiles([])}
        />
      );
    }

    return <DocumentUploadZone onFilesSelected={handleFilesSelected} />;
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
                onDeleteDocument={handleDeleteDocument}
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
                icon={<FileText className="w-5 h-5 text-primary" />}
              />

              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Breadcrumb bar with upload button */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
                  <CategoryBreadcrumb
                    category={selectedCategory}
                    onNavigate={setSelectedCategory}
                  />
                  {user && (
                    <Button
                      variant={showUploadZone ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setShowUploadZone(!showUploadZone)}
                      className="shrink-0"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Ladda upp
                    </Button>
                  )}
                </div>

                {/* Upload zone - conditionally shown */}
                {(showUploadZone || stagedFiles.length > 0) && (
                  <div className="p-4 border-b border-border">
                    {renderUploadZone()}
                  </div>
                )}

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
                    onSelectDocument={handleSelectDocument}
                    onSearchChange={setSearchQuery}
                    onStatusFilterChange={setStatusFilter}
                    onExtensionFilterChange={setExtensionFilter}
                    onSortChange={(field, dir) => {
                      setSortField(field);
                      setSortDirection(dir);
                    }}
                    onCategoryChange={setSelectedCategory}
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
            icon={<FileText className="w-5 h-5 text-primary" />}
          />

          {/* Category breadcrumb trigger for mobile with upload button */}
          <div className="px-4 py-2 border-b border-border bg-card flex items-center justify-between gap-2">
            <CategoryBreadcrumb
              category={selectedCategory}
              onNavigate={setSelectedCategory}
              compact
              onClick={() => setMobileCategoryDrawerOpen(true)}
            />
            {user && (
              <Button
                variant={showUploadZone ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowUploadZone(!showUploadZone)}
                className="shrink-0"
              >
                <Upload className="w-4 h-4 mr-1" />
                Ladda upp
              </Button>
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Upload zone - conditionally shown */}
            {(showUploadZone || stagedFiles.length > 0) && (
              <div className="p-4 border-b border-border">
                {renderUploadZone()}
              </div>
            )}

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
                onSelectDocument={handleSelectDocument}
                onSearchChange={setSearchQuery}
                onStatusFilterChange={setStatusFilter}
                onExtensionFilterChange={setExtensionFilter}
                onSortChange={(field, dir) => {
                  setSortField(field);
                  setSortDirection(dir);
                }}
                onCategoryChange={setSelectedCategory}
                onClearFilters={handleClearFilters}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            </div>
          </div>
        </main>

        {/* Mobile Category Drawer */}
        <Sheet open={mobileCategoryDrawerOpen} onOpenChange={setMobileCategoryDrawerOpen}>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0 bg-card">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle>Kategorier</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto">
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
                onDeleteDocument={handleDeleteDocument}
                totalCount={documents.length}
                uncategorizedCount={uncategorizedCount}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Preview Drawer */}
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetContent side="right" className="w-[85vw] max-w-md p-0 bg-panel">
            <SheetHeader className="p-4 border-b border-sidebar-border">
              <SheetTitle className="text-panel-foreground">
                {selectedDocument?.title || "Dokumentdetaljer"}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto">
              <DocumentPreviewPanel
                document={selectedDocument}
                categories={categories}
                onRollback={(docId, versionId) => {
                  setRollbackConfirm({ docId, versionId });
                  setMobileDrawerOpen(false);
                }}
                onCategoryChange={handleDocumentCategoryChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Radera dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokumentet kommer att markeras som raderat men kan återställas
              senare. Filen finns kvar i systemet.
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

      {/* Rollback confirmation dialog */}
      <AlertDialog
        open={!!rollbackConfirm}
        onOpenChange={() => setRollbackConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Återställ version?</AlertDialogTitle>
            <AlertDialogDescription>
              Den valda versionen blir aktiv och alla nyare versioner markeras
              som inaktiva. Du kan alltid återställa till en annan version
              senare.
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
