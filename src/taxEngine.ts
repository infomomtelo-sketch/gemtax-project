export interface TaxProfile {
  w2Income: number;
  net1099Income: number;
  filingStatus: 'single' | 'married_joint' | 'hoh';
}

export const calculate2026Taxes = (profile: TaxProfile) => {
  // 2026 IRS Thresholds
  const SS_WAGE_BASE = 184500; 
  const SE_ADJ_FACTOR = 0.9235; 
  
  const standardDeductions = {
    single: 16100,
    married_joint: 32200,
    hoh: 24150
  };

  // 1. SELF-EMPLOYMENT (SE) TAX CALCULATION
  const taxableSEIncome = profile.net1099Income * SE_ADJ_FACTOR;
  
  // SS Portion (Social Security stops after $184,500 total income)
  const remainingSSCap = Math.max(0, SS_WAGE_BASE - profile.w2Income);
  const taxableSS = Math.min(taxableSEIncome, remainingSSCap);
  const ssTax = taxableSS * 0.124;

  // Medicare Portion (Uncapped 2.9%)
  const medicareTax = taxableSEIncome * 0.029;
  
  const totalSETax = ssTax + medicareTax;
  const seDeduction = totalSETax * 0.5; // Half of SE tax is deductible

  // 2. TAXABLE INCOME CALCULATION
  const grossIncome = profile.w2Income + profile.net1099Income;
  const adjustedGrossIncome = grossIncome - seDeduction;
  const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeductions[profile.filingStatus]);

  // 3. 2026 BRACKET ESTIMATION (Single Filer Example)
  let estimatedFederalTax = 0;
  if (taxableIncome <= 12400) {
    estimatedFederalTax = taxableIncome * 0.10;
  } else if (taxableIncome <= 50400) {
    estimatedFederalTax = 1240 + (taxableIncome - 12400) * 0.12;
  } else {
    estimatedFederalTax = 5800 + (taxableIncome - 50400) * 0.22;
  }

  return {
    summary: {
      totalIncome: grossIncome,
      selfEmploymentTax: totalSETax,
      federalIncomeTax: estimatedFederalTax,
      effectiveRate: ((totalSETax + estimatedFederalTax) / grossIncome * 100).toFixed(2) + "%"
    },
    breakdown: {
      taxableSS,
      ssTax,
      medicareTax,
      seDeduction,
      taxableIncome
    }
  };
};
