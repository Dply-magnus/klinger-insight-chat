-- Add unique constraint on path column to enable upsert
ALTER TABLE klinger_categories ADD CONSTRAINT klinger_categories_path_unique UNIQUE (path);