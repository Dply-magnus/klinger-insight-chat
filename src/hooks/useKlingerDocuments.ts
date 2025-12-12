import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentStatus } from "@/lib/documentTypes";
import { Tables } from "@/integrations/supabase/types";

type KlingerDocument = Tables<'klinger_documents'>;
type KlingerDocumentVersion = Tables<'klinger_document_versions'>;

function mapSupabaseToDocument(
  doc: KlingerDocument,
  versions: KlingerDocumentVersion[]
): Document {
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const currentVersion = sortedVersions.find(v => v.status === 'active') || sortedVersions[0];

  const mapVersion = (v: KlingerDocumentVersion) => ({
    id: v.id,
    filename: v.storage_path.split('/').pop() || doc.filename,
    storagePath: v.storage_path,
    uploadedAt: new Date(v.created_at),
    status: v.status as DocumentStatus,
  });

  return {
    id: doc.id,
    title: doc.name,
    filename: doc.filename,
    storagePath: doc.storage_path,
    category: doc.category || undefined,
    createdAt: new Date(doc.created_at),
    currentVersion: currentVersion ? mapVersion(currentVersion) : {
      id: doc.id,
      filename: doc.filename,
      storagePath: doc.storage_path,
      uploadedAt: new Date(doc.created_at),
      status: doc.status as DocumentStatus,
    },
    versions: sortedVersions.map(mapVersion),
  };
}

export function useKlingerDocuments() {
  return useQuery({
    queryKey: ["klinger-documents"],
    queryFn: async (): Promise<Document[]> => {
      // Fetch all documents
      const { data: docs, error: docsError } = await supabase
        .from("klinger_documents")
        .select("*")
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;
      if (!docs?.length) return [];

      // Fetch all versions for these documents
      const { data: versions, error: versionsError } = await supabase
        .from("klinger_document_versions")
        .select("*")
        .in("document_id", docs.map(d => d.id));

      if (versionsError) throw versionsError;

      // Map to frontend format
      return docs.map(doc =>
        mapSupabaseToDocument(
          doc,
          versions?.filter(v => v.document_id === doc.id) || []
        )
      );
    },
  });
}
