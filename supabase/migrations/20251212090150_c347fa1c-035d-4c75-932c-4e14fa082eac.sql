-- Create table for persisting categories (including empty ones)
CREATE TABLE public.klinger_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

-- Enable RLS
ALTER TABLE public.klinger_categories ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view categories
CREATE POLICY "Authenticated users can view categories"
  ON public.klinger_categories FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create categories
CREATE POLICY "Authenticated users can create categories"
  ON public.klinger_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can delete own categories
CREATE POLICY "Users can delete own categories"
  ON public.klinger_categories FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Users can update own categories
CREATE POLICY "Users can update own categories"
  ON public.klinger_categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);