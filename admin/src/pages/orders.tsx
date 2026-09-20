// admin/src/pages/orders.tsx
'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Order { uid: string; email: string; displayName: string; subscription: string; subscriptionExpiresAt: any; stripeSubscriptionId?: string; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'users'), where('subscription', 'in', ['essential', 'premium'])))
      .then(snap => { setOrders(snap.docs.map(d => d.data() as Order)); setLoading(false); });
  }, []);

  const revenue = orders.reduce((sum, o) => {
    if (o.subscription === 'premium') return sum + 9.99;
    if (o.subscription === 'essential') return sum + 4.99;
    return sum;
  }, 0);

  return (
    <div style={css.page}>
      <div style={css.topBar}>
        <h1 style={css.title}>Active Subscriptions <span style={css.count}>{orders.length}</span></h1>
        <div style={css.revenueBox}>
          <span style={css.revenueLabel}>Est. MRR</span>
          <span style={css.revenueVal}>${revenue.toFixed(2)}</span>
        </div>
      </div>

      {loading ? <div style={css.loading}>Loading…</div> : (
        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead><tr>{['User', 'Email', 'Plan', 'Expires', 'Stripe ID'].map(h => <th key={h} style={css.th}>{h}</th>)}</tr></thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={i} style={css.tr}>
                  <td style={css.td}>{o.displayName || '—'}</td>
                  <td style={css.td}>{o.email}</td>
                  <td style={css.td}><span style={{ ...css.badge, ...(o.subscription === 'premium' ? css.prem : css.ess) }}>{o.subscription}</span></td>
                  <td style={css.td}>{o.subscriptionExpiresAt?.seconds ? new Date(o.subscriptionExpiresAt.seconds * 1000).toLocaleDateString() : '—'}</td>
                  <td style={{ ...css.td, fontFamily: 'monospace', fontSize: 11, color: '#6b6b6b' }}>{o.stripeSubscriptionId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const css: Record<string, React.CSSProperties> = {
  page: { padding: 40, fontFamily: '-apple-system,sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontFamily: 'Georgia', fontSize: 24, fontWeight: 400, color: '#0a0a0a', margin: 0, display: 'flex', alignItems: 'center', gap: 12 },
  count: { fontFamily: 'Georgia', fontSize: 16, color: '#6b6b6b' },
  revenueBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, background: 'white', border: '1px solid rgba(0,0,0,0.09)', padding: '12px 20px' },
  revenueLabel: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b6b' },
  revenueVal: { fontFamily: 'Georgia', fontSize: 28, color: '#0a0a0a' },
  loading: { padding: 60, textAlign: 'center', color: '#6b6b6b' },
  tableWrap: { overflowX: 'auto', border: '1px solid rgba(0,0,0,0.09)', background: 'white' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { textAlign: 'left', padding: '10px 16px', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b6b', borderBottom: '1px solid rgba(0,0,0,0.09)', background: '#faf9f7' },
  tr: { borderBottom: '1px solid rgba(0,0,0,0.06)' },
  td: { padding: '13px 16px', color: '#1a1a1a' },
  badge: { fontSize: 10, letterSpacing: 1, padding: '3px 8px', textTransform: 'uppercase' },
  prem: { background: '#0a0a0a', color: 'white' },
  ess: { border: '1px solid rgba(0,0,0,0.15)', color: '#1a1a1a' },
};
