import { api } from '@/lib/api';

// Website endpoints behind the service forms on bookfxorder.com. Request bodies match the
// ones the website's own forms send.

export const CONTACT_SUBJECTS = [
  'General Inquiry',
  'Indo-Nepal Transfer',
  'Digital Signature (DSC)',
  'Loans',
  'Credit Cards',
  'Partnership / Business',
  'Other',
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export type ContactRequest = {
  name: string;
  email: string;
  phone: string;
  subject: ContactSubject;
  message: string;
};

export function submitContact(body: ContactRequest) {
  return api<Record<string, unknown>>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type DscRequest = {
  name: string;
  mobile: string;
  email: string;
  pan: string;
  panName: string;
  aadhaar: string;
  aadhaarVid: string;
  dob: string;
  fatherName: string;
  address: string;
  pinCode: string;
  state: string;
  city: string;
  remarks: string;
  verificationMode: string;
  emailVerified: boolean;
  applicantType: 'Individual' | 'Organisation';
  plan: string;
  documentNames: string[];
  videoKycCompleted: boolean;
};

export function submitDsc(body: DscRequest) {
  return api<Record<string, unknown>>('/api/dsc/submit-request', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type LoanRequest = {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  employmentType: string;
  monthlyIncome: string;
  loanType: string;
  loanAmount: number;
  tenureMonths: number;
};

export type LoanOrder = {
  applicationCode: string;
  loanTypeLabel: string;
  loanAmount: number;
  tenureMonths: number;
  interestRate: number;
  emi: number;
};

export function createLoanOrder(body: LoanRequest) {
  return api<LoanOrder>('/api/loans/create-order', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type LoanStage = {
  key: string;
  label: string;
  status: string;
  reached: boolean;
  isCurrent: boolean;
};

export type LoanLookup = LoanOrder & {
  success: boolean;
  currentStatus: string;
  stages: LoanStage[];
};

export function lookupLoan(code: string, email: string) {
  const query = `code=${encodeURIComponent(code.trim())}&email=${encodeURIComponent(email.trim())}`;
  return api<LoanLookup>(`/api/loans/lookup?${query}`);
}

export const BUSINESS_TYPES = ['Exporter', 'Supplier', 'Manufacturer', 'MSME', 'Distributor', 'Enterprise', 'Other'] as const;
export const FINANCING_TYPES = ['Invoice Financing', 'Purchase Order Finance', 'Receivables Finance', 'Not Sure Yet'] as const;
export const REQUIREMENT_AMOUNTS = ['Under ₹5 Lakh', '₹5–25 Lakh', '₹25 Lakh – ₹1 Crore', 'Above ₹1 Crore'] as const;

export type ScfRequest = {
  fullName: string;
  businessName: string;
  email: string;
  mobile: string;
  businessType: string;
  financingType: string;
  requirementAmount: string;
  message: string;
};

export function submitSupplyChainFinance(body: ScfRequest) {
  return api<{ requestCode?: string }>('/api/supply-chain-finance/submit-request', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function lookupPincode(pin: string) {
  return api<{ state: string; city: string }>(`/api/pincode?pin=${pin}`);
}

export function isValidMobile(phone: string) {
  return phone.replace(/\D/g, '').length === 10;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
