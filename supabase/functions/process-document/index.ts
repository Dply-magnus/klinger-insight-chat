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
    const { documentId, title, filename, category, fileUrl, version } = await req.json();

    console.log('Processing document:', { documentId, title, filename, category, version });

    const webhookUrl = Deno.env.get('N8N_DOCUMENT_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('N8N_DOCUMENT_WEBHOOK_URL is not configured');
    }

    console.log('Sending to n8n webhook...');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        title,
        filename,
        category,
        fileUrl,
        version,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      throw new Error(`n8n webhook failed: ${response.status} ${errorText}`);
    }

    const result = await response.text();
    console.log('n8n webhook response:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Document sent to n8n for processing' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-document function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
