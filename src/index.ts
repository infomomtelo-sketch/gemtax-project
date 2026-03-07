import { calculate2026Taxes, TaxProfile } from './taxEngine';

// Define the environment interface for D1
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/calculate") {
      try {
        const body: any = await request.json();
        const results = calculate2026Taxes(body);
        
        // SAVE TO DATABASE
        // We use a dummy email for now, or pass it from the frontend
        const email = body.email || "anonymous@gemtax.app";
        
        await env.DB.prepare(
          "INSERT INTO tax_entries (user_email, w2_income, net_1099_income, tax_owed) VALUES (?, ?, ?, ?)"
        ).bind(email, body.w2Income, body.net1099Income, results.summary.totalTax).run();

        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
      }
    }

    // NEW: Endpoint to fetch history
    if (url.pathname === "/history") {
      const { results } = await env.DB.prepare("SELECT * FROM tax_entries ORDER BY created_at DESC LIMIT 10").all();
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    return new Response("Gemtax API + D1 Database Live", { status: 200 });
  }
};
