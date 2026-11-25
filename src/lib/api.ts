import { API_BASE_URL, authClient, IS_WEB } from '@/lib/auth-client';

// The website quotes a fixed rate on /indo-nepal ("1 INR = 1.6 NPR") and has no rate API.
export const INR_TO_NPR = 1.6;

// Calls a website API route with the signed-in user's session cookie attached.
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Browsers forbid setting Cookie by hand; there the session cookie is sent automatically.
  const cookie = IS_WEB ? '' : authClient.getCookie();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: IS_WEB ? 'same-origin' : 'omit',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...init?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export type Transaction = {
  id: string;
  amountInr: number;
  amountNpr: number;
  exchangeRate: number;
  provider: string;
  paymentStatus: string;
  remitStatus: string;
  trackingNumber: string | null;
  createdAt: string;
};

export function getTransfers() {
  return api<{ success: boolean; transactions: Transaction[] }>('/api/remit/history');
}

export type SenderDetails = { name: string; email: string; phone: string };

// Same request the website's Indo-Nepal form sends.
export function submitTransfer(amountInr: number, senderDetails: SenderDetails) {
  return api<Record<string, unknown>>('/api/remit/submit-request', {
    method: 'POST',
    body: JSON.stringify({ amountInr, provider: 'prabhu', senderDetails }),
  });
}

export type StepState = 'done' | 'pending' | 'failed';

// The backend's status strings aren't documented, so classify them by keyword.
export function statusState(status: string | null | undefined): StepState {
  const s = (status ?? '').toLowerCase();
  if (/(success|complete|paid|captured|delivered|done|approved|settled)/.test(s)) return 'done';
  if (/(fail|reject|cancel|declin|refund|expired)/.test(s)) return 'failed';
  return 'pending';
}

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `${date} • ${time}`;
}
