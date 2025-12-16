import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IngestQueuePage {
  id: string;
  filename: string | null;
  image_url: string | null;
  content: string | null;
  page_number: number | null;
  document_id: string | null;
  status: string | null;
  created_at: string | null;
  document?: {
    name: string;
    category: string;
  };
}

export function useIngestQueue() {
  const queryClient = useQueryClient();

  const pendingPagesQuery = useQuery({
    queryKey: ['ingest-queue', 'pending'],
    queryFn: async (): Promise<IngestQueuePage[]> => {
      // Fetch pending pages
      const { data: pages, error } = await supabase
        .from('ingest_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching pending pages:", error);
        throw error;
      }

      if (!pages || pages.length === 0) {
        return [];
      }

      // Get unique document IDs
      const documentIds = [...new Set(pages.map(p => p.document_id).filter(Boolean))];

      // Fetch document info if we have document IDs
      let documentsMap: Record<string, { name: string; category: string }> = {};
      if (documentIds.length > 0) {
        const { data: documents } = await supabase
          .from('klinger_documents')
          .select('id, name, category')
          .in('id', documentIds);

        if (documents) {
          documentsMap = documents.reduce((acc, doc) => {
            acc[doc.id] = { name: doc.name, category: doc.category };
            return acc;
          }, {} as Record<string, { name: string; category: string }>);
        }
      }

      // Merge document info into pages
      return pages.map(page => ({
        ...page,
        document: page.document_id ? documentsMap[page.document_id] : undefined,
      }));
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from('ingest_queue')
        .update({ content })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingest-queue'] });
      toast.success("Innehåll sparat");
    },
    onError: (error) => {
      console.error("Error updating content:", error);
      toast.error("Kunde inte spara innehåll");
    },
  });

  const approvePagesMutation = useMutation({
    mutationFn: async (pageIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('approve-ocr-pages', {
        body: { pageIds },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ingest-queue'] });
      toast.success(data.message || "Sidor skickade för vektorisering");
    },
    onError: (error) => {
      console.error("Error approving pages:", error);
      toast.error("Kunde inte godkänna sidor");
    },
  });

  const pendingCount = pendingPagesQuery.data?.length ?? 0;

  return {
    pendingPages: pendingPagesQuery.data ?? [],
    pendingCount,
    isLoading: pendingPagesQuery.isLoading,
    error: pendingPagesQuery.error,
    updateContent: updateContentMutation.mutate,
    isUpdating: updateContentMutation.isPending,
    approvePages: approvePagesMutation.mutate,
    isApproving: approvePagesMutation.isPending,
    refetch: pendingPagesQuery.refetch,
  };
}
