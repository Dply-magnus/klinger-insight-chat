-- Create storage policies for the uploads bucket

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow all authenticated users to read files (for document sharing)
CREATE POLICY "Authenticated users can read all uploads"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
);