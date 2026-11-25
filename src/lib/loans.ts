// Loan products, copied from the website's loan calculator (bookfxorder.com/loans).

export type LoanProduct = {
  id: 'personal' | 'business' | 'education' | 'home';
  label: string;
  sub: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  step: number;
  defaultAmount: number;
  tenureOptions: number[];
  defaultTenure: number;
  processingFeePct: number;
};

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'personal',
    label: 'Personal Loan',
    sub: 'For any personal need — no collateral required',
    interestRate: 11.5,
    minAmount: 50000,
    maxAmount: 2000000,
    step: 10000,
    defaultAmount: 500000,
    tenureOptions: [12, 24, 36, 48, 60],
    defaultTenure: 36,
    processingFeePct: 1.5,
  },
  {
    id: 'business',
    label: 'Business Loan',
    sub: 'Working capital & expansion funding',
    interestRate: 14,
    minAmount: 100000,
    maxAmount: 5000000,
    step: 25000,
    defaultAmount: 1000000,
    tenureOptions: [12, 24, 36, 48, 60, 84],
    defaultTenure: 48,
    processingFeePct: 2,
  },
  {
    id: 'education',
    label: 'MBBS Abroad Education Loan',
    sub: 'Tuition, hostel, travel & insurance for MBBS abroad',
    interestRate: 9.5,
    minAmount: 500000,
    maxAmount: 15000000,
    step: 50000,
    defaultAmount: 3500000,
    tenureOptions: [60, 84, 120, 180],
    defaultTenure: 120,
    processingFeePct: 1,
  },
  {
    id: 'home',
    label: 'Home Loan',
    sub: 'Purchase, construct, or renovate your home',
    interestRate: 8.5,
    minAmount: 500000,
    maxAmount: 10000000,
    step: 50000,
    defaultAmount: 3000000,
    tenureOptions: [60, 120, 180, 240],
    defaultTenure: 180,
    processingFeePct: 0.5,
  },
];

export const EMPLOYMENT_TYPES = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self-employed', label: 'Self-Employed Professional' },
  { value: 'business-owner', label: 'Business Owner' },
  { value: 'student', label: 'Student' },
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]['value'];

// Standard reducing-balance EMI, rounded like the website.
export function monthlyEmi(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100;
  if (r === 0) return Math.round(principal / months);
  const f = Math.pow(1 + r, months);
  return Math.round((principal * r * f) / (f - 1));
}

export function formatTenure(months: number) {
  return months % 12 === 0 ? `${months / 12} yrs` : `${months} mo`;
}

// "₹35 L", "₹1.5 Cr" — compact amounts for chips and summaries.
export function formatLakh(amount: number) {
  if (amount >= 10000000) return `₹${+(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${+(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}
