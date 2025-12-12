import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, versionId, success, error: errorMessage } = await req.json();

    console.log('Document processed callback:', { documentId, versionId, success, errorMessage });

    if (!documentId) {
      throw new Error('documentId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const newStatus = success ? 'active' : 'inactive';

    // Update version status
    if (versionId) {
      const { error: versionError } = await supabase
        .from('klinger_document_versions')
        .update({ status: newStatus })
        .eq('id', versionId);

      if (versionError) {
        console.error('Error updating version:', versionError);
      }
    }

    // Update document status
    const { error: docError } = await supabase
      .from('klinger_documents')
      .update({ status: newStatus })
      .eq('id', documentId);

    if (docError) {
      console.error('Error updating document:', docError);
      throw docError;
    }

    console.log(`Document ${documentId} status updated to ${newStatus}`);

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in document-processed function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
