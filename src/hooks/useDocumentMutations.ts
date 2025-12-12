import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function uploadFileToStorage(file: File, userId: string): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `documents/${userId}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(storagePath, file);

  if (error) throw error;
  return storagePath;
}

export function useDocumentMutations() {
  const queryClient = useQueryClient();

  // Upload new document
  const uploadDocument = useMutation({
    mutationFn: async ({
      file,
      title,
      category,
      userId,
    }: {
      file: File;
      title: string;
      category?: string;
      userId: string;
    }) => {
      const storagePath = await uploadFileToStorage(file, userId);
      const extension = file.name.split('.').pop() || '';

      // Create document
      const { data: doc, error: docError } = await supabase
        .from('klinger_documents')
        .insert({
          name: title,
          filename: file.name,
          extension,
          category: category || '',
          storage_path: storagePath,
          size: file.size,
          uploaded_by: userId,
          status: 'pending',
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create first version
      const { error: versionError } = await supabase
        .from('klinger_document_versions')
        .insert({
          document_id: doc.id,
          version: '1.0',
          storage_path: storagePath,
          size: file.size,
          uploaded_by: userId,
          status: 'pending',
        });

      if (versionError) throw versionError;
      return doc;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-documents"] }),
  });

  // Replace existing document (new version)
  const replaceDocument = useMutation({
    mutationFn: async ({
      documentId,
      file,
      title,
      category,
      userId,
      currentVersionId,
    }: {
      documentId: string;
      file: File;
      title: string;
      category?: string;
      userId: string;
      currentVersionId: string;
    }) => {
      const storagePath = await uploadFileToStorage(file, userId);

      // Mark current version as inactive
      await supabase
        .from('klinger_document_versions')
        .update({ status: 'inactive' })
        .eq('id', currentVersionId);

      // Count existing versions for version number
      const { count } = await supabase
        .from('klinger_document_versions')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId);

      // Create new version
      await supabase
        .from('klinger_document_versions')
        .insert({
          document_id: documentId,
          version: `${(count || 0) + 1}.0`,
          storage_path: storagePath,
          size: file.size,
          uploaded_by: userId,
          status: 'pending',
        });

      // Update document
      await supabase
        .from('klinger_documents')
        .update({
          name: title,
          category: category || '',
          storage_path: storagePath,
          size: file.size,
          status: 'pending',
        })
        .eq('id', documentId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-documents"] }),
  });

  // Update status
  const updateStatus = useMutation({
    mutationFn: async ({
      documentId,
      versionId,
    status,
  }: {
    documentId: string;
    versionId: string;
    status: 'active' | 'inactive';
  }) => {
      await supabase
        .from('klinger_document_versions')
        .update({ status })
        .eq('id', versionId);

      await supabase
        .from('klinger_documents')
        .update({ status })
        .eq('id', documentId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-documents"] }),
  });

  // Update category and ensure category hierarchy is persisted
  const updateCategory = useMutation({
    mutationFn: async ({ documentId, category, userId }: { 
      documentId: string; 
      category: string;
      userId: string;
    }) => {
      // Update the document's category
      await supabase
        .from('klinger_documents')
        .update({ category })
        .eq('id', documentId);

      // Ensure category and all parent categories exist in database
      if (category) {
        const segments = category.split("/");
        let currentPath = "";
        
        for (const segment of segments) {
          currentPath = currentPath ? `${currentPath}/${segment}` : segment;
          
          // Upsert category (insert if doesn't exist, ignore if it does)
          await supabase
            .from('klinger_categories')
            .upsert({
              path: currentPath,
              name: segment,
              created_by: userId,
            }, { 
              onConflict: 'path',
              ignoreDuplicates: true 
            });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["klinger-documents"] });
      queryClient.invalidateQueries({ queryKey: ["klinger-categories"] });
    },
  });

  // Rollback to previous version
  const rollbackVersion = useMutation({
    mutationFn: async ({
      documentId,
      targetVersionId,
      newerVersionIds,
    }: {
      documentId: string;
      targetVersionId: string;
      newerVersionIds: string[];
    }) => {
      // Mark newer versions as inactive
      if (newerVersionIds.length > 0) {
        await supabase
          .from('klinger_document_versions')
          .update({ status: 'inactive' })
          .in('id', newerVersionIds);
      }

      // Activate target version
      const { data: targetVersion } = await supabase
        .from('klinger_document_versions')
        .update({ status: 'active' })
        .eq('id', targetVersionId)
        .select()
        .single();

      // Update main document
      if (targetVersion) {
        await supabase
          .from('klinger_documents')
          .update({
            storage_path: targetVersion.storage_path,
            status: 'active',
          })
          .eq('id', documentId);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-documents"] }),
  });

  // Hard delete document (permanent removal)
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // Delete all versions first (due to FK constraint)
      const { error: versionsError } = await supabase
        .from('klinger_document_versions')
        .delete()
        .eq('document_id', documentId);

      if (versionsError) throw versionsError;

      // Delete the document permanently
      const { error: docError } = await supabase
        .from('klinger_documents')
        .delete()
        .eq('id', documentId);

      if (docError) throw docError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-documents"] }),
  });

  // Create category
  const createCategory = useMutation({
    mutationFn: async ({ path, name, userId }: { path: string; name: string; userId: string }) => {
      const { error } = await supabase
        .from('klinger_categories')
        .insert({
          path,
          name,
          created_by: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-categories"] }),
  });

  // Delete category
  const deleteCategory = useMutation({
    mutationFn: async (path: string) => {
      // Delete this category and all subcategories
      await supabase
        .from('klinger_categories')
        .delete()
        .or(`path.eq.${path},path.like.${path}/%`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-categories"] }),
  });

  // Rename category
  const renameCategory = useMutation({
    mutationFn: async ({ oldPath, newPath }: { oldPath: string; newPath: string }) => {
      // Get all categories that need updating
      const { data: categories } = await supabase
        .from('klinger_categories')
        .select('*')
        .or(`path.eq.${oldPath},path.like.${oldPath}/%`);

      if (categories && categories.length > 0) {
        for (const cat of categories) {
          const updatedPath = cat.path === oldPath 
            ? newPath 
            : cat.path.replace(oldPath + '/', newPath + '/');
          
          await supabase
            .from('klinger_categories')
            .update({ path: updatedPath, name: updatedPath.split('/').pop() || cat.name })
            .eq('id', cat.id);
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-categories"] }),
  });

  // Send document to n8n for processing
  const sendToN8n = useMutation({
    mutationFn: async ({
      documentId,
      versionId,
      title,
      filename,
      category,
      storagePath,
    }: {
      documentId: string;
      versionId: string;
      title: string;
      filename: string;
      category: string;
      storagePath: string;
    }) => {
      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(storagePath);

      // Update status to "processing"
      await supabase
        .from('klinger_document_versions')
        .update({ status: 'processing' })
        .eq('id', versionId);

      await supabase
        .from('klinger_documents')
        .update({ status: 'processing' })
        .eq('id', documentId);

      // Call Edge Function to send to n8n
      const { error } = await supabase.functions.invoke('process-document', {
        body: {
          documentId,
          title,
          filename,
          category,
          fileUrl: urlData.publicUrl,
          version: versionId,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["klinger-documents"] }),
  });

  return {
    uploadDocument,
    replaceDocument,
    updateStatus,
    updateCategory,
    rollbackVersion,
    deleteDocument,
    createCategory,
    deleteCategory,
    renameCategory,
    sendToN8n,
  };
}
