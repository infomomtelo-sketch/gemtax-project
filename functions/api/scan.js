export async function onRequestPost(context) {
    const { request } = context;
    const body = await request.json();
    const text = body.text.toLowerCase();

    // 2026 Tax Logic (March 2026 Official Rates)
    let income = 50000; // Default base for demo
    let deductions = 0;

    // 1. Overtime Deduction (OBBB Act: Max $12,500)
    if (text.includes("overtime") || text.includes("ਓਵਰਟਾਈਮ")) {
        deductions += 5000; 
    }

    // 2. Car Loan Interest (OBBB Act: Max $10,000 for US-made)
    if (text.includes("car") || text.includes("truck") || text.includes("ਗੱਡੀ")) {
        deductions += 1500;
    }

    // 3. Tip Exemption (OBBB Act: Max $25,000)
    if (text.includes("tips") || text.includes("ਟਿਪਸ")) {
        deductions += 3000;
    }

    // Refund Logic: Assuming 22% tax bracket savings
    const refund = (deductions * 0.22).toFixed(2);

    return new Response(JSON.stringify({
        success: true,
        income: income.toLocaleString(),
        deductions: deductions.toLocaleString(),
        refund: refund
    }), {
        headers: { "Content-Type": "application/json" }
    });
}
