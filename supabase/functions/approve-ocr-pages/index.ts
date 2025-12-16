import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TableColumn {
  group: string | null;
  label: string;
}

interface TableRow {
  category: string;
  row_label: string;
  values: (string | null)[];
}

interface OCRJsonContent {
  meta: {
    filename: string;
    page_number: number;
  };
  page_context: string;
  legend: Record<string, string>;
  table: {
    has_table: boolean;
    columns: TableColumn[];
    rows: TableRow[];
  };
}

function convertJsonToVectorText(jsonContent: OCRJsonContent): string {
  const legend = jsonContent.legend || {};
  let output = jsonContent.page_context || "";
  
  if (jsonContent.table?.has_table) {
    output += "\n\n";
    const cols = jsonContent.table.columns;
    
    // Group rows by category
    let currentCategory = "";
    
    for (const row of jsonContent.table.rows) {
      // Add category header if changed
      if (row.category && row.category !== currentCategory) {
        currentCategory = row.category;
        output += `## ${currentCategory}\n\n`;
      }
      
      output += `### ${row.row_label}\n`;
      
      row.values.forEach((val, index) => {
        if (val && val !== "") {
          const col = cols[index];
          const productName = col.group ? `${col.group} - ${col.label}` : col.label;
          const meaning = legend[val] ? ` (${legend[val]})` : "";
          output += `- ${productName}: ${val}${meaning}\n`;
        }
      });
      output += "\n";
    }
  }
  
  return output.trim();
}

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

    // Convert JSON content to vector text and send pages to n8n
    console.log(`Converting and sending ${pages.length} pages to n8n webhook`);
    
    const processedPages = pages.map(page => {
      let vectorText = page.content || "";
      
      // Try to parse as JSON and convert
      try {
        const jsonContent = JSON.parse(page.content) as OCRJsonContent;
        vectorText = convertJsonToVectorText(jsonContent);
        console.log(`Page ${page.id}: Converted JSON to vector text (${vectorText.length} chars)`);
      } catch {
        // Content is not JSON, use as-is
        console.log(`Page ${page.id}: Using plain text content`);
      }
      
      return {
        id: page.id,
        filename: page.filename,
        image_url: page.image_url,
        content: vectorText,
        page_number: page.page_number,
        document_id: page.document_id,
      };
    });
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pages: processedPages }),
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
