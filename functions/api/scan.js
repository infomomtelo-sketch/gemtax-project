export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { userInput, lang } = await request.json();

    // 2026 OBBB Act Extraction Logic
    // We look for keywords in English and Punjabi
    let income = 0;
    let overtime = 0;
    let carInterest = 0;
    let tips = 0;

    // 1. Extract Income (Simple regex for numbers)
    const amounts = userInput.match(/\d+/g);
    if (amounts) income = Math.max(...amounts.map(Number));

    // 2. Scan for Overtime (OBBB Act: up to $12,500 deductible)
    if (userInput.toLowerCase().includes("overtime") || userInput.includes("ਓਵਰਟਾਈਮ")) {
        overtime = Math.min(income * 0.1, 12500); // Estimating 10% of income as OT
    }

    // 3. Scan for Car Interest (OBBB Act: up to $10,000 deductible)
    if (userInput.toLowerCase().includes("car") || userInput.includes("loan") || userInput.includes("ਗੱਡੀ")) {
        carInterest = 1500; // Average deductible interest
    }

    // 4. Scan for Tips (OBBB Act: up to $25,000 deductible)
    if (userInput.toLowerCase().includes("tips") || userInput.includes("ਟਿਪਸ")) {
        tips = Math.min(income * 0.2, 25000); 
    }

    // Calculate Estimated Refund (Simplified 2026 Math)
    // Refund = (Deductions * tax_rate)
    const totalDeductions = overtime + carInterest + tips;
    const refundEstimate = totalDeductions * 0.22; // Assuming 22% bracket

    return new Response(JSON.stringify({
      success: true,
      refund: refundEstimate.toFixed(2),
      data: {
        income: income,
        overtime: overtime,
        carInterest: carInterest,
        tips: tips
      },
      message: lang === 'pa' ? "ਮੈਂ ਤੁਹਾਡੀ ਬਚਤ ਲੱਭ ਲਈ ਹੈ!" : "I found your savings!"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
