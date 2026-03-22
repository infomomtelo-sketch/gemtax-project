export async function onRequestPost(context) {
  const { request, env } = context;
  const { userInput, user_guid } = await request.json();

  // 1. Basic AI Scraper (We will upgrade this to Gemini later)
  let income = parseFloat(userInput.replace(/[^0-9.]/g, '')) || 0;
  let overtime = userInput.includes("overtime") ? 5000 : 0;
  let refund = (overtime * 0.22);

  // 2. AUTO-SAVE to D1 Database
  // This ensures the "Auto-Resume" works!
  await env.DB.prepare(`
    INSERT INTO TaxReturns (user_guid, w2_wages, qualified_overtime, estimated_refund)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_guid) DO UPDATE SET
    w2_wages = excluded.w2_wages,
    qualified_overtime = excluded.qualified_overtime,
    estimated_refund = excluded.estimated_refund
  `).bind(user_guid, income, overtime, refund).run();

  return new Response(JSON.stringify({ 
    success: true, 
    data: { income, overtime },
    refund: refund.toFixed(2)
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
