import type Ionicons from '@expo/vector-icons/Ionicons';

import { formatDateTime, formatInr, statusState, type StepState, type Transaction } from '@/lib/api';
import type { AppOrder, OrderKind } from '@/lib/orders';

// One row in History / one thing to track: either a money transfer from the website's API
// or an order placed from the app.

export type Activity = {
  key: string;
  kind: OrderKind;
  title: string;
  amountLabel: string;
  subtitle: string;
  createdAt: string;
  state: StepState;
  statusLabel: string;
  transfer?: Transaction;
  order?: AppOrder;
};

export type Step = {
  title: string;
  detail: string;
  state: StepState;
};

export const KIND_ICONS: Record<Activity['kind'], keyof typeof Ionicons.glyphMap> = {
  transfer: 'paper-plane',
  dsc: 'finger-print',
  loan: 'cash',
  'credit-card': 'card',
  scf: 'document-text',
};

const STATE_LABELS: Record<StepState, string> = {
  done: 'Success',
  pending: 'Pending',
  failed: 'Failed',
};

export function transferActivity(t: Transaction): Activity {
  const state = statusState(t.remitStatus);
  return {
    key: `transfer:${t.id}`,
    kind: 'transfer',
    title: 'Money Transfer to Nepal',
    amountLabel: formatInr(t.amountInr),
    subtitle: `NPR ${t.amountNpr.toLocaleString('en-IN')}`,
    createdAt: t.createdAt,
    state,
    statusLabel: STATE_LABELS[state],
    transfer: t,
  };
}

export function orderActivity(o: AppOrder): Activity {
  let state: StepState = 'pending';
  let statusLabel = 'Submitted';
  if (o.kind === 'loan' && o.loanStatus) {
    const s = o.loanStatus.toUpperCase();
    if (s === 'DISBURSED') state = 'done';
    if (/REJECT|CANCEL/.test(s)) state = 'failed';
    statusLabel = s === 'DISBURSED' ? 'Disbursed' : s === 'APPROVED' ? 'Approved' : state === 'failed' ? 'Rejected' : 'In Review';
  }
  return {
    key: `order:${o.id}`,
    kind: o.kind,
    title: o.title,
    amountLabel: o.amountLabel ?? (o.amount ? formatInr(o.amount) : ''),
    subtitle: o.subtitle,
    createdAt: o.createdAt,
    state,
    statusLabel,
    order: o,
  };
}

export function transferSteps(t: Transaction): Step[] {
  const payment = statusState(t.paymentStatus);
  const remit = statusState(t.remitStatus);
  return [
    { title: 'Request Submitted', detail: formatDateTime(t.createdAt), state: 'done' },
    {
      title: payment === 'failed' ? 'Payment Failed' : 'Payment Received',
      detail: t.paymentStatus || 'Awaiting payment',
      state: payment,
    },
    {
      title: 'Under Process',
      detail: payment === 'done' ? 'Sending to Nepal via Prabhu' : 'Starts after payment',
      state: remit === 'done' ? 'done' : payment === 'done' ? remit : 'pending',
    },
    {
      title: remit === 'failed' ? 'Transfer Failed' : 'Money Delivered',
      detail: remit === 'done' ? `NPR ${t.amountNpr.toLocaleString('en-IN')} credited` : t.remitStatus || 'Pending',
      state: remit,
    },
  ];
}

// The service steps each request goes through. Only loans have a live status API, so for
// the others just the submission is confirmed; our team updates customers by phone/email.
const SERVICE_STEPS: Record<Exclude<OrderKind, 'loan'>, [string, string][]> = {
  transfer: [
    ['Payment', 'Our team contacts you to complete payment'],
    ['Under Process', 'Sending to Nepal via Prabhu'],
    ['Money Delivered', 'Credited to the recipient in Nepal'],
  ],
  dsc: [
    ['Verification & Video KYC', 'Our team contacts you to verify documents'],
    ['Payment', 'Secure payment link sent to your mobile and email'],
    ['CA Approval', 'Certifying Authority approves your certificate'],
    ['Certificate Issued', 'DSC delivered on your USB token'],
  ],
  'credit-card': [
    ['Specialist Call', 'Our card specialist calls to confirm your details'],
    ['Bank Application', 'Application submitted with the issuing bank'],
    ['Card Approved', 'Usually within 24–48 hours of bank review'],
  ],
  scf: [
    ['Business Assessment', 'Our finance team reviews your requirement'],
    ['Documents & Offer', 'KYC, GST and invoice review, then a financing offer'],
    ['Funds Disbursed', 'Working capital released against your invoices/POs'],
  ],
};

export function orderSteps(o: AppOrder): Step[] {
  const submitted: Step = { title: 'Request Submitted', detail: formatDateTime(o.createdAt), state: 'done' };
  if (o.kind === 'loan') {
    if (o.loanStages?.length) {
      return o.loanStages.map((s) => ({
        title: s.label,
        detail: s.isCurrent ? 'Current stage' : s.reached ? 'Completed' : 'Pending',
        state: s.reached ? 'done' : 'pending',
      }));
    }
    return [
      submitted,
      { title: 'Document & Credit Review', detail: 'Pending', state: 'pending' },
      { title: 'Loan Approved', detail: 'Pending', state: 'pending' },
      { title: 'Amount Disbursed', detail: 'Pending', state: 'pending' },
    ];
  }
  return [submitted, ...SERVICE_STEPS[o.kind].map(([title, detail]) => ({ title, detail, state: 'pending' as const }))];
}
