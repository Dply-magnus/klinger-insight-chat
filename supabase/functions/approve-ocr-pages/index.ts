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
    const { pageIds } = await req.json();

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      console.error("Missing or invalid pageIds");
      return new Response(
        JSON.stringify({ error: "pageIds array is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${pageIds.length} pages for approval`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const n8nWebhookUrl = Deno.env.get('N8N_OCR_VECTORIZE_WEBHOOK_URL');

    if (!n8nWebhookUrl) {
      console.error("N8N_OCR_VECTORIZE_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ error: "N8N webhook URL not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the pages to be approved with their content
    const { data: pages, error: fetchError } = await supabase
      .from('ingest_queue')
      .select('id, filename, image_url, content, page_number, document_id')
      .in('id', pageIds)
      .eq('status', 'pending');

    if (fetchError) {
      console.error("Error fetching pages:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch pages" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pages || pages.length === 0) {
      console.log("No pending pages found with the given IDs");
      return new Response(
        JSON.stringify({ error: "No pending pages found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pages.length} pending pages to process`);

    // Update status to 'processing'
    const { error: updateError } = await supabase
      .from('ingest_queue')
      .update({ status: 'processing' })
      .in('id', pageIds);

    if (updateError) {
      console.error("Error updating page status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update page status" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send pages to n8n for vectorization
    console.log(`Sending ${pages.length} pages to n8n webhook`);
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pages: pages.map(page => ({
          id: page.id,
          filename: page.filename,
          image_url: page.image_url,
          content: page.content,
          page_number: page.page_number,
          document_id: page.document_id,
        })),
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error(`n8n webhook failed: ${n8nResponse.status} - ${errorText}`);
      
      // Revert status back to pending on failure
      await supabase
        .from('ingest_queue')
        .update({ status: 'pending' })
        .in('id', pageIds);

      return new Response(
        JSON.stringify({ error: "Failed to send to n8n webhook" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully sent ${pages.length} pages to n8n`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${pages.length} pages sent for vectorization`,
        processedIds: pageIds 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
