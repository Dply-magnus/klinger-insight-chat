-- Migration: Synka Supabase med frontend-typer

-- 1. Byt namn på enum-värden
ALTER TYPE klinger_document_status RENAME VALUE 'archived' TO 'inactive';
ALTER TYPE klinger_document_status RENAME VALUE 'draft' TO 'deleted';

-- 2. Lägg till status på versions-tabellen
ALTER TABLE klinger_document_versions 
ADD COLUMN status klinger_document_status NOT NULL DEFAULT 'active';