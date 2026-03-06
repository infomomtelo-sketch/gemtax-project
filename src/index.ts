import { calculate2026Taxes, TaxProfile } from './taxEngine';
export default {
  async fetch(request: Request): Promise<Response> {
    // Handle CORS for your SaaS frontend
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Main calculation endpoint
    if (request.method === "POST" && url.pathname === "/calculate") {
      try {
        const data: TaxProfile = await request.json();
        const results = calculate2026Taxes(data);
        
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON input" }), { 
          status: 400, 
          headers: corsHeaders 
        });
      }
    }

    return new Response("Gemtax API is Live", { status: 200 });
  }
};
