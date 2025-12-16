import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { sessionId, image_url, message, current_table } = await req.json();

    console.log('Table builder request:', { sessionId, message, hasImage: !!image_url });

    const webhookUrl = Deno.env.get('N8N_TABLE_BUILDER_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('N8N_TABLE_BUILDER_WEBHOOK_URL is not configured');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId, 
        image_url, 
        message, 
        current_table: current_table || { columns: [], rows: [] }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    let result = await response.json();
    
    // n8n kan returnera antingen ett objekt eller en array - hantera båda
    if (Array.isArray(result)) {
      result = result[0] || { response: "Tomt svar från agenten", structured_data: { type: "none", data: [] } };
    }
    
    console.log('n8n response received:', { hasResponse: !!result.response, hasStructuredData: !!result.structured_data });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Table builder error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
