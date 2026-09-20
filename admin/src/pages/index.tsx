// admin/src/pages/index.tsx  (Next.js pages router)
'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  totalSearches: number;
  totalFavorites: number;
}

interface RecentUser {
  uid: string;
  email: string;
  displayName: string;
  subscription: string;
  createdAt: Timestamp;
  searchCount: number;
  favoritesCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, premiumUsers: 0, totalSearches: 0, totalFavorites: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(d => d.data() as RecentUser);

      const totalSearches = users.reduce((sum, u) => sum + (u.searchCount || 0), 0);
      const totalFavorites = users.reduce((sum, u) => sum + (u.favoritesCount || 0), 0);
      const premiumUsers = users.filter(u => u.subscription === 'premium').length;

      setStats({ totalUsers: users.length, premiumUsers, totalSearches, totalFavorites });
      setRecentUsers(
        users
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 20)
      );
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div style={css.loading}>Loading...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={css.statsGrid}>
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '○' },
              { label: 'Premium Users', value: stats.premiumUsers, icon: '✦' },
              { label: 'Total Searches', value: stats.totalSearches, icon: '◈' },
              { label: 'Total Favorites', value: stats.totalFavorites, icon: '♡' },
            ].map(s => (
              <div key={s.label} style={css.statCard}>
                <span style={css.statIcon}>{s.icon}</span>
                <div style={css.statNum}>{s.value.toLocaleString()}</div>
                <div style={css.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Conversion */}
          <div style={css.section}>
            <h2 style={css.sectionTitle}>Conversion Rate</h2>
            <div style={css.convRow}>
              <span style={css.convLabel}>Free → Premium</span>
              <div style={css.convBar}>
                <div style={{ ...css.convFill, width: `${stats.totalUsers ? (stats.premiumUsers / stats.totalUsers * 100) : 0}%` }} />
              </div>
              <span style={css.convPct}>
                {stats.totalUsers ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* Recent Users Table */}
          <div style={css.section}>
            <h2 style={css.sectionTitle}>Recent Users</h2>
            <div style={css.tableWrap}>
              <table style={css.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Plan', 'Searches', 'Favorites', 'Joined'].map(h => (
                      <th key={h} style={css.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.uid} style={css.tr}>
                      <td style={css.td}>{u.displayName}</td>
                      <td style={css.td}>{u.email}</td>
                      <td style={css.td}>
                        <span style={{ ...css.badge, ...(u.subscription === 'premium' ? css.badgePremium : css.badgeFree) }}>
                          {u.subscription === 'premium' ? '✦ Premium' : 'Free'}
                        </span>
                      </td>
                      <td style={{ ...css.td, textAlign: 'center' }}>{u.searchCount || 0}</td>
                      <td style={{ ...css.td, textAlign: 'center' }}>{u.favoritesCount || 0}</td>
                      <td style={css.td}>
                        {u.createdAt?.seconds
                          ? new Date(u.createdAt.seconds * 1000).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

// ── ADMIN LAYOUT ─────────────────────────────────────────────
function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={css.root}>
      {/* Sidebar */}
      <aside style={css.sidebar}>
        <div style={css.sidebarLogo}>
          <span style={css.logoS}>S</span>
          <span style={css.logoText}>CENTIA</span>
          <span style={css.adminBadge}>Admin</span>
        </div>
        <nav style={css.nav}>
          {[
            { label: 'Dashboard', icon: '◈', href: '/' },
            { label: 'Users', icon: '○', href: '/users' },
            { label: 'Catalog', icon: '◉', href: '/catalog' },
            { label: 'Orders', icon: '◇', href: '/orders' },
            { label: 'Analytics', icon: '◫', href: '/analytics' },
            { label: 'Settings', icon: '◌', href: '/settings' },
          ].map(item => (
            <a key={item.label} href={item.href} style={css.navItem}>
              <span style={css.navIcon}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={css.main}>
        <header style={css.header}>
          <h1 style={css.pageTitle}>{title}</h1>
          <span style={css.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </header>
        <div style={css.content}>{children}</div>
      </main>
    </div>
  );
}

// ── INLINE STYLES ─────────────────────────────────────────────
const css: Record<string, React.CSSProperties> = {
  root: { display: 'flex', minHeight: '100vh', background: '#faf9f7', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' },
  sidebar: { width: 220, background: '#0a0a0a', padding: '32px 0', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarLogo: { padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 },
  logoS: { fontFamily: 'Georgia', fontSize: 22, color: 'white', fontStyle: 'italic' },
  logoText: { fontSize: 11, letterSpacing: 4, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  adminBadge: { fontSize: 8, letterSpacing: 2, color: '#8b7355', border: '1px solid #8b7355', padding: '2px 6px', textTransform: 'uppercase', marginLeft: 4 },
  nav: { display: 'flex', flexDirection: 'column' },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 12, letterSpacing: 1, transition: 'color 0.2s' },
  navIcon: { fontSize: 14, width: 16, textAlign: 'center' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  header: { background: 'white', borderBottom: '1px solid rgba(0,0,0,0.09)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontFamily: 'Georgia', fontSize: 24, fontWeight: 400, color: '#0a0a0a', margin: 0 },
  headerDate: { fontSize: 11, color: '#6b6b6b', letterSpacing: 1 },
  content: { padding: 40, flex: 1, overflowY: 'auto' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#6b6b6b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(0,0,0,0.09)', border: '1px solid rgba(0,0,0,0.09)', marginBottom: 32 },
  statCard: { background: 'white', padding: '28px 24px', display: 'flex', flexDirection: 'column' },
  statIcon: { fontSize: 18, color: '#8b7355', marginBottom: 12 },
  statNum: { fontFamily: 'Georgia', fontSize: 36, color: '#0a0a0a', marginBottom: 4 },
  statLabel: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b6b' },
  section: { background: 'white', border: '1px solid rgba(0,0,0,0.09)', padding: 28, marginBottom: 24 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 18, fontWeight: 400, color: '#0a0a0a', margin: '0 0 20px 0' },
  convRow: { display: 'flex', alignItems: 'center', gap: 16 },
  convLabel: { fontSize: 12, color: '#6b6b6b', minWidth: 120 },
  convBar: { flex: 1, height: 4, background: 'rgba(0,0,0,0.06)' },
  convFill: { height: '100%', background: '#0a0a0a', transition: 'width 0.6s ease' },
  convPct: { fontFamily: 'Georgia', fontSize: 20, color: '#0a0a0a', minWidth: 60, textAlign: 'right' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { textAlign: 'left', padding: '10px 16px', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b6b', borderBottom: '1px solid rgba(0,0,0,0.09)' },
  tr: { borderBottom: '1px solid rgba(0,0,0,0.06)' },
  td: { padding: '14px 16px', color: '#1a1a1a' },
  badge: { fontSize: 10, letterSpacing: 1, padding: '3px 8px', textTransform: 'uppercase' },
  badgePremium: { background: '#0a0a0a', color: 'white' },
  badgeFree: { border: '1px solid rgba(0,0,0,0.09)', color: '#6b6b6b' },
};
