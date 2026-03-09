// UK Tax Year 2024/25 constants
const PERSONAL_ALLOWANCE_ANNUAL = 12630;
const NI_THRESHOLD_WEEKLY = 242;
const NI_LOWER_RATE = 0.08; // 8% between £242-£967/week
const NI_UPPER_THRESHOLD_WEEKLY = 967;
const NI_HIGHER_RATE = 0.02; // 2% above £967/week
const INCOME_TAX_RATE = 0.20; // 20% basic rate
const PENSION_RATE = 0.05; // 5%
const PENSION_THRESHOLD_WEEKLY = 130; // approx £520/month ÷ 4 weeks

export interface TaxCalculation {
  grossPay: number;
  incomeTax: number;
  nationalInsurance: number;
  pension: number;
  totalDeductions: number;
  netPay: number;
}

/**
 * Calculate tax deductions for a 4-week pay period
 * @param grossPay - Total gross pay for the 4-week period
 * @param pensionEnabled - Whether pension contributions are enabled
 * @returns Tax calculation breakdown
 */
export function calculateTax(
  grossPay: number,
  pensionEnabled: boolean = true
): TaxCalculation {
  // For 4-week period calculations
  const weeksInPeriod = 4;
  const weeklyGrossPay = grossPay / weeksInPeriod;
  
  // Income Tax calculation (based on annual allowance)
  // Personal allowance for 4 weeks: £12,630/year ÷ 13 periods ≈ £971.54
  const personalAllowancePeriod = PERSONAL_ALLOWANCE_ANNUAL / 13;
  const taxableIncome = Math.max(0, grossPay - personalAllowancePeriod);
  const incomeTax = taxableIncome * INCOME_TAX_RATE;
  
  // National Insurance calculation (weekly basis)
  let totalNI = 0;
  for (let week = 0; week < weeksInPeriod; week++) {
    if (weeklyGrossPay <= NI_THRESHOLD_WEEKLY) {
      // No NI below threshold
      continue;
    } else if (weeklyGrossPay <= NI_UPPER_THRESHOLD_WEEKLY) {
      // 8% on earnings above £242/week
      const niableAmount = weeklyGrossPay - NI_THRESHOLD_WEEKLY;
      totalNI += niableAmount * NI_LOWER_RATE;
    } else {
      // 8% on £242-£967, 2% above £967
      const lowerBandAmount = NI_UPPER_THRESHOLD_WEEKLY - NI_THRESHOLD_WEEKLY;
      const upperBandAmount = weeklyGrossPay - NI_UPPER_THRESHOLD_WEEKLY;
      totalNI += (lowerBandAmount * NI_LOWER_RATE) + (upperBandAmount * NI_HIGHER_RATE);
    }
  }
  
  // Pension calculation (5% on earnings above threshold)
  let pension = 0;
  if (pensionEnabled) {
    const pensionThresholdPeriod = PENSION_THRESHOLD_WEEKLY * weeksInPeriod;
    const pensionableIncome = Math.max(0, grossPay - pensionThresholdPeriod);
    pension = pensionableIncome * PENSION_RATE;
  }
  
  const totalDeductions = incomeTax + totalNI + pension;
  const netPay = grossPay - totalDeductions;
  
  return {
    grossPay: Math.round(grossPay * 100) / 100,
    incomeTax: Math.round(incomeTax * 100) / 100,
    nationalInsurance: Math.round(totalNI * 100) / 100,
    pension: Math.round(pension * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
  };
}

/**
 * Calculate hours worked, accounting for breaks
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Hours worked (with break deduction if > 8 hours)
 */
export function calculateHoursWorked(startTime: string, endTime: string): number {
  const [startHour, startMin] = (startTime ?? '00:00').split(':').map(Number);
  const [endHour, endMin] = (endTime ?? '00:00').split(':').map(Number);
  
  const startMinutes = (startHour ?? 0) * 60 + (startMin ?? 0);
  const endMinutes = (endHour ?? 0) * 60 + (endMin ?? 0);
  
  let totalMinutes = endMinutes - startMinutes;
  
  // Handle overnight shifts
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }
  
  let hours = totalMinutes / 60;
  
  // Deduct 1 hour break if shift > 8 hours
  if (hours > 8) {
    hours -= 1;
  }
  
  return Math.round(hours * 100) / 100;
}

/**
 * Get the current 4-week pay period dates
 * @param startDate - Optional start date for the period
 * @returns Start and end dates for the pay period
 */
export function getCurrentPayPeriod(startDate?: Date): { startDate: Date; endDate: Date } {
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 27); // 4 weeks = 28 days - 1 for end date
  end.setHours(23, 59, 59, 999);
  
  return { startDate: start, endDate: end };
}
