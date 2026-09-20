// admin/src/pages/users.tsx
'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface User {
  uid: string; email: string; displayName: string;
  subscription: string; createdAt: any;
  searchCount: number; favoritesCount: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
      .then(snap => { setUsers(snap.docs.map(d => d.data() as User)); setLoading(false); });
  }, []);

  async function togglePremium(uid: string, current: string) {
    const next = current === 'premium' ? 'free' : 'premium';
    await updateDoc(doc(db, 'users', uid), { subscription: next });
    setUsers(u => u.map(x => x.uid === uid ? { ...x, subscription: next } : x));
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={css.page}>
      <div style={css.topBar}>
        <h1 style={css.title}>Users <span style={css.count}>{users.length}</span></h1>
        <input
          style={css.search} placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <div style={css.loading}>Loading…</div> : (
        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead>
              <tr>{['Name','Email','Plan','Searches','Favorites','Joined','Action'].map(h =>
                <th key={h} style={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.uid} style={css.tr}>
                  <td style={css.td}>{u.displayName || '—'}</td>
                  <td style={css.td}>{u.email}</td>
                  <td style={css.td}>
                    <span style={{ ...css.badge, ...(u.subscription === 'premium' ? css.prem : css.free) }}>
                      {u.subscription === 'premium' ? '✦ Premium' : 'Free'}
                    </span>
                  </td>
                  <td style={{ ...css.td, textAlign: 'center' }}>{u.searchCount || 0}</td>
                  <td style={{ ...css.td, textAlign: 'center' }}>{u.favoritesCount || 0}</td>
                  <td style={css.td}>{u.createdAt?.seconds ? new Date(u.createdAt.seconds*1000).toLocaleDateString() : '—'}</td>
                  <td style={css.td}>
                    <button style={css.actionBtn} onClick={() => togglePremium(u.uid, u.subscription)}>
                      {u.subscription === 'premium' ? 'Revoke' : 'Grant Premium'}
                    </button>
                  </td>
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
  search: { border: '1px solid rgba(0,0,0,0.09)', padding: '10px 16px', fontSize: 13, outline: 'none', width: 280, background: '#fff' },
  loading: { padding: 60, textAlign: 'center', color: '#6b6b6b' },
  tableWrap: { overflowX: 'auto', border: '1px solid rgba(0,0,0,0.09)', background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { textAlign: 'left', padding: '10px 16px', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b6b', borderBottom: '1px solid rgba(0,0,0,0.09)', background: '#faf9f7' },
  tr: { borderBottom: '1px solid rgba(0,0,0,0.06)' },
  td: { padding: '13px 16px', color: '#1a1a1a' },
  badge: { fontSize: 10, letterSpacing: 1, padding: '3px 8px', textTransform: 'uppercase' },
  prem: { background: '#0a0a0a', color: 'white' },
  free: { border: '1px solid rgba(0,0,0,0.09)', color: '#6b6b6b' },
  actionBtn: { border: '1px solid rgba(0,0,0,0.12)', padding: '6px 12px', fontSize: 11, cursor: 'pointer', background: 'transparent', letterSpacing: 1 },
};
