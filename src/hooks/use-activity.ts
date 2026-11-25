import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { orderActivity, transferActivity, type Activity } from '@/lib/activity';
import { getTransfers, type Transaction } from '@/lib/api';
import { loadOrders, updateOrders, type AppOrder } from '@/lib/orders';
import { lookupLoan } from '@/lib/services-api';

// Loans have a live status API; refresh the stored status of each loan placed from the app.
async function refreshLoans(orders: AppOrder[]) {
  const loans = orders.filter((o) => o.kind === 'loan' && o.reference && o.email).slice(0, 10);
  if (!loans.length) return orders;
  const results = await Promise.all(
    loans.map((o) =>
      lookupLoan(o.reference!, o.email!).then(
        (r) => ({ id: o.id, status: r.currentStatus, stages: r.stages }),
        () => null,
      ),
    ),
  );
  const updates = new Map(results.filter((r) => r !== null).map((r) => [r.id, r]));
  if (!updates.size) return orders;
  return updateOrders((all) =>
    all.map((o) => {
      const u = updates.get(o.id);
      return u ? { ...o, loanStatus: u.status, loanStages: u.stages } : o;
    }),
  );
}

// A local transfer copy is hidden once the website lists the same transfer
// (same amount, created within 15 minutes).
function listedByServer(order: AppOrder, transfers: Transaction[]) {
  if (order.kind !== 'transfer') return false;
  const placed = new Date(order.createdAt).getTime();
  return transfers.some(
    (t) => t.amountInr === order.amount && Math.abs(new Date(t.createdAt).getTime() - placed) < 15 * 60 * 1000,
  );
}

// Everything the user has ordered: website money transfers plus app orders, newest first.
// Reloads whenever the screen regains focus, so a new order shows up straight away.
export function useActivity() {
  // null until the first load finishes.
  const [items, setItems] = useState<Activity[] | null>(null);
  const [transfers, setTransfers] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [transferResult, orders] = await Promise.all([
      getTransfers().then(
        (data) => ({ list: data.transactions, error: '' }),
        (e) => ({ list: [] as Transaction[], error: e instanceof Error ? e.message : 'Could not load your transfers.' }),
      ),
      loadOrders(),
    ]);

    const merge = (list: AppOrder[]) =>
      [
        ...transferResult.list.map(transferActivity),
        ...list.filter((o) => !listedByServer(o, transferResult.list)).map(orderActivity),
      ].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    setTransfers(transferResult.list);
    setError(transferResult.error);
    setItems(merge(orders));

    // Show stored data first, then update with live loan statuses.
    const refreshed = await refreshLoans(orders).catch(() => orders);
    if (refreshed !== orders) setItems(merge(refreshed));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return { items, transfers, error, refreshing, refresh };
}
