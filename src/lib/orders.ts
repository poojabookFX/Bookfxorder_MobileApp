import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { authClient } from '@/lib/auth-client';
import type { LoanStage } from '@/lib/services-api';

// The website only exposes history for money transfers (/api/remit/history). DSC, loan,
// credit card and supply chain finance requests are recorded here when they're placed from
// the app, so History and Tracking can show them. Stored per account on the device.

// 'transfer' is a local copy of a money transfer, shown until the website lists it.
export type OrderKind = 'transfer' | 'dsc' | 'loan' | 'credit-card' | 'scf';

export type AppOrder = {
  id: string;
  kind: OrderKind;
  title: string;
  subtitle: string;
  amount?: number;
  amountLabel?: string;
  reference?: string;
  createdAt: string;
  // Loans only: used to fetch live status from /api/loans/lookup.
  email?: string;
  loanStatus?: string;
  loanStages?: LoanStage[];
};

async function storageKey() {
  // A network failure here just means the orders go under "guest" instead of being lost.
  const { data } = await authClient.getSession().catch(() => ({ data: null }));
  const userId = (data as { user?: { id?: string } } | null)?.user?.id ?? 'guest';
  return `bookfx-orders-${userId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  const file = new File(Paths.document, `${key}.json`);
  return file.exists ? file.text() : null;
}

async function writeRaw(key: string, value: string) {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Storage blocked (private mode): the order still went to the server.
    }
    return;
  }
  const file = new File(Paths.document, `${key}.json`);
  if (!file.exists) file.create();
  await file.write(value);
}

export async function loadOrders(): Promise<AppOrder[]> {
  try {
    const raw = await readRaw(await storageKey());
    return raw ? (JSON.parse(raw) as AppOrder[]) : [];
  } catch {
    return [];
  }
}

async function saveOrders(orders: AppOrder[]) {
  await writeRaw(await storageKey(), JSON.stringify(orders));
}

export async function recordOrder(order: Omit<AppOrder, 'id' | 'createdAt'>) {
  const entry: AppOrder = {
    ...order,
    id: `${order.kind}-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  try {
    const orders = await loadOrders();
    await saveOrders([entry, ...orders]);
  } catch {
    // Recording is best-effort; the request itself already succeeded.
  }
  return entry;
}

export async function updateOrders(update: (orders: AppOrder[]) => AppOrder[]) {
  const orders = await loadOrders();
  const next = update(orders);
  await saveOrders(next);
  return next;
}
