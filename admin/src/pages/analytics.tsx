// admin/src/pages/analytics.tsx
'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UserData {
  subscription: string;
  searchCount: number;
  favoritesCount: number;
  createdAt: any;
}

export default function AnalyticsPage() {
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => setUsers(snap.docs.map(d => d.data() as UserData)));
  }, []);

  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.subscription === 'premium').length;
  const convRate = totalUsers ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0';
  const avgSearches = totalUsers ? (users.reduce((s, u) => s + (u.searchCount || 0), 0) / totalUsers).toFixed(1) : '0';
  const avgFavs = totalUsers ? (users.reduce((s, u) => s + (u.favoritesCount || 0), 0) / totalUsers).toFixed(1) : '0';

  // Group signups by month (last 6 months)
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months[d.toLocaleString('default', { month: 'short' })] = 0;
  }
  users.forEach(u => {
    if (!u.createdAt?.seconds) return;
    const d = new Date(u.createdAt.seconds * 1000);
    const label = d.toLocaleString('default', { month: 'short' });
    if (label in months) months[label]++;
  });

  const maxMonth = Math.max(...Object.values(months), 1);

  return (
    <div style={css.page}>
      <h1 style={css.title}>Analytics</h1>

      {/* KPI row */}
      <div style={css.kpiRow}>
        {[
          { label: 'Total Users', value: totalUsers },
          { label: 'Premium Users', value: premiumUsers },
          { label: 'Conversion Rate', value: `${convRate}%` },
          { label: 'Avg Searches / User', value: avgSearches },
          { label: 'Avg Favorites / User', value: avgFavs },
        ].map(k => (
          <div key={k.label} style={css.kpi}>
            <div style={css.kpiVal}>{k.value}</div>
            <div style={css.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Signups chart */}
      <div style={css.chartBox}>
        <h2 style={css.chartTitle}>New Users — Last 6 Months</h2>
        <div style={css.barChart}>
          {Object.entries(months).map(([month, count]) => (
            <div key={month} style={css.barCol}>
              <div style={css.barLabel}>{count}</div>
              <div style={{ ...css.bar, height: `${(count / maxMonth) * 160}px` }} />
              <div style={css.barMonth}>{month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan distribution */}
      <div style={css.chartBox}>
        <h2 style={css.chartTitle}>Plan Distribution</h2>
        <div style={css.planDist}>
          <div style={css.planRow}>
            <span style={css.planLabel}>Free</span>
            <div style={css.planTrack}>
              <div style={{ ...css.planFill, width: `${totalUsers ? ((totalUsers - premiumUsers) / totalUsers * 100) : 0}%`, background: '#e0e0e0' }} />
            </div>
            <span style={css.planPct}>{totalUsers - premiumUsers} users</span>
          </div>
          <div style={css.planRow}>
            <span style={css.planLabel}>Premium</span>
            <div style={css.planTrack}>
              <div style={{ ...css.planFill, width: `${totalUsers ? (premiumUsers / totalUsers * 100) : 0}%`, background: '#0a0a0a' }} />
            </div>
            <span style={css.planPct}>{premiumUsers} users</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const css: Record<string, React.CSSProperties> = {
  page: { padding: 40, fontFamily: '-apple-system,sans-serif' },
  title: { fontFamily: 'Georgia', fontSize: 24, fontWeight: 400, color: '#0a0a0a', margin: '0 0 28px 0' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1, background: 'rgba(0,0,0,0.09)', border: '1px solid rgba(0,0,0,0.09)', marginBottom: 24 },
  kpi: { background: 'white', padding: '24px 20px' },
  kpiVal: { fontFamily: 'Georgia', fontSize: 30, color: '#0a0a0a', marginBottom: 6 },
  kpiLabel: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b6b' },
  chartBox: { background: 'white', border: '1px solid rgba(0,0,0,0.09)', padding: 28, marginBottom: 20 },
  chartTitle: { fontFamily: 'Georgia', fontSize: 18, fontWeight: 400, margin: '0 0 24px 0', color: '#0a0a0a' },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 16, height: 200 },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  barLabel: { fontSize: 12, color: '#6b6b6b', fontFamily: 'Georgia' },
  bar: { width: '100%', background: '#0a0a0a', minHeight: 4, transition: 'height 0.6s ease' },
  barMonth: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#c8c4bc' },
  planDist: { display: 'flex', flexDirection: 'column', gap: 16 },
  planRow: { display: 'flex', alignItems: 'center', gap: 16 },
  planLabel: { fontSize: 12, color: '#6b6b6b', minWidth: 60 },
  planTrack: { flex: 1, height: 4, background: '#f0f0f0' },
  planFill: { height: '100%', transition: 'width 0.6s ease' },
  planPct: { fontSize: 12, color: '#1a1a1a', minWidth: 70, textAlign: 'right' },
};
