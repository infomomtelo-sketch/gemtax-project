import { calculate2026Taxes, TaxProfile } from './taxEngine';

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);

    // 1. ENDPOINT: Calculate and Save
    if (request.method === "POST" && url.pathname === "/calculate") {
      try {
        const body: any = await request.json();
        const results = calculate2026Taxes(body);
        const email = body.email || "anonymous@gemtax.app";
        
        // Save to D1
        await env.DB.prepare(
          "INSERT INTO tax_entries (user_email, w2_income, net_1099_income, tax_owed) VALUES (?, ?, ?, ?)"
        ).bind(email, body.w2Income, body.net1099Income, results.summary.selfEmploymentTax + results.summary.federalIncomeTax).run();

        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
      }
    }

    // 2. ENDPOINT: Fetch Full History
    if (url.pathname === "/history") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM tax_entries ORDER BY created_at DESC LIMIT 20"
      ).all();
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // 3. ENDPOINT: Quarterly Summary (Current Q1 2026)
    if (url.pathname === "/quarterly-summary") {
      const q1Start = "2026-01-01 00:00:00";
      const q1End = "2026-03-31 23:59:59";
      
      const stats: any = await env.DB.prepare(
        "SELECT SUM(tax_owed) as totalQ1Tax, COUNT(*) as entryCount FROM tax_entries WHERE created_at BETWEEN ? AND ?"
      ).bind(q1Start, q1End).first();
      
      return new Response(JSON.stringify({
        totalQ1Tax: stats?.totalQ1Tax || 0,
        entryCount: stats?.entryCount || 0,
        deadline: "April 15, 2026"
      }), { headers: corsHeaders });
    }

    return new Response("Gemtax API + D1 Database Live", { status: 200 });
  }
};
