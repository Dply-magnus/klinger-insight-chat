-- Add UPDATE policy for klinger_document_versions
CREATE POLICY "Users can update versions of own documents" 
ON public.klinger_document_versions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM klinger_documents
    WHERE klinger_documents.id = klinger_document_versions.document_id 
    AND klinger_documents.uploaded_by = auth.uid()
  )
);