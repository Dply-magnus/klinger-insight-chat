-- Enable RLS on n8n_chat_histories table
-- This table stores chat history and should not be publicly accessible
-- Only service_role (n8n backend) needs access, which bypasses RLS automatically
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on documents table
-- This table stores document content and embeddings for AI search
-- Only service_role (n8n backend) needs access for RAG queries
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;