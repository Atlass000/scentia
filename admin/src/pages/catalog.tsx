// admin/src/pages/catalog.tsx
'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Fragrance {
  id?: string; name: string; house: string; type: string;
  topNotes: string; heartNotes: string; baseNotes: string;
  saveCount?: number;
}

const EMPTY: Fragrance = { name: '', house: '', type: 'Niche', topNotes: '', heartNotes: '', baseNotes: '' };

export default function CatalogPage() {
  const [items, setItems] = useState<Fragrance[]>([]);
  const [form, setForm] = useState<Fragrance>(EMPTY);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getDocs(query(collection(db, 'catalog'), orderBy('name')))
      .then(snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as Fragrance))));
  }, []);

  async function handleAdd() {
    if (!form.name || !form.house) return;
    setAdding(true);
    try {
      const docRef = await addDoc(collection(db, 'catalog'), { ...form, saveCount: 0, createdAt: serverTimestamp() });
      setItems(prev => [...prev, { ...form, id: docRef.id }]);
      setForm(EMPTY); setShowForm(false);
    } finally { setAdding(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this fragrance from catalog?')) return;
    await deleteDoc(doc(db, 'catalog', id));
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div style={css.page}>
      <div style={css.topBar}>
        <h1 style={css.title}>Catalog <span style={css.count}>{items.length}</span></h1>
        <button style={css.addBtn} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Fragrance'}
        </button>
      </div>

      {showForm && (
        <div style={css.formBox}>
          <h3 style={css.formTitle}>Add to Catalog</h3>
          <div style={css.formGrid}>
            {([
              ['Name', 'name'], ['House', 'house'],
              ['Top Notes', 'topNotes'], ['Heart Notes', 'heartNotes'], ['Base Notes', 'baseNotes'],
            ] as [string, keyof Fragrance][]).map(([label, key]) => (
              <div key={key} style={css.field}>
                <label style={css.fieldLabel}>{label}</label>
                <input
                  style={css.input} value={form[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={label}
                />
              </div>
            ))}
            <div style={css.field}>
              <label style={css.fieldLabel}>Type</label>
              <select style={css.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option>Niche</option><option>Designer</option>
              </select>
            </div>
          </div>
          <button style={css.saveBtn} onClick={handleAdd} disabled={adding}>
            {adding ? 'Saving…' : 'Save to Catalog'}
          </button>
        </div>
      )}

      <div style={css.tableWrap}>
        <table style={css.table}>
          <thead>
            <tr>{['Name', 'House', 'Type', 'Top Notes', 'Heart Notes', 'Base Notes', 'Saves', ''].map(h =>
              <th key={h} style={css.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={css.tr}>
                <td style={css.td}><strong>{item.name}</strong></td>
                <td style={css.td}>{item.house}</td>
                <td style={css.td}><span style={{ ...css.badge, ...(item.type === 'Niche' ? css.niche : css.designer) }}>{item.type}</span></td>
                <td style={{ ...css.td, color: '#6b6b6b', fontSize: 11 }}>{item.topNotes}</td>
                <td style={{ ...css.td, color: '#6b6b6b', fontSize: 11 }}>{item.heartNotes}</td>
                <td style={{ ...css.td, color: '#6b6b6b', fontSize: 11 }}>{item.baseNotes}</td>
                <td style={{ ...css.td, textAlign: 'center' }}>{item.saveCount ?? 0}</td>
                <td style={css.td}>
                  <button style={css.deleteBtn} onClick={() => handleDelete(item.id!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const css: Record<string, React.CSSProperties> = {
  page: { padding: 40, fontFamily: '-apple-system,sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontFamily: 'Georgia', fontSize: 24, fontWeight: 400, color: '#0a0a0a', margin: 0, display: 'flex', alignItems: 'center', gap: 12 },
  count: { fontFamily: 'Georgia', fontSize: 16, color: '#6b6b6b' },
  addBtn: { background: '#0a0a0a', color: 'white', border: 'none', padding: '10px 20px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' },
  formBox: { background: 'white', border: '1px solid rgba(0,0,0,0.09)', padding: 28, marginBottom: 24 },
  formTitle: { fontFamily: 'Georgia', fontSize: 18, fontWeight: 400, margin: '0 0 20px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b6b' },
  input: { border: '1px solid rgba(0,0,0,0.09)', padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  saveBtn: { background: '#0a0a0a', color: 'white', border: 'none', padding: '12px 28px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' },
  tableWrap: { overflowX: 'auto', border: '1px solid rgba(0,0,0,0.09)', background: 'white' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { textAlign: 'left', padding: '10px 16px', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b6b', borderBottom: '1px solid rgba(0,0,0,0.09)', background: '#faf9f7' },
  tr: { borderBottom: '1px solid rgba(0,0,0,0.06)' },
  td: { padding: '13px 16px', color: '#1a1a1a' },
  badge: { fontSize: 9, letterSpacing: 2, padding: '3px 7px', textTransform: 'uppercase' },
  niche: { background: '#0a0a0a', color: 'white' },
  designer: { border: '1px solid rgba(0,0,0,0.12)', color: '#6b6b6b' },
  deleteBtn: { border: '1px solid rgba(200,0,0,0.2)', color: '#c0392b', background: 'none', padding: '5px 10px', fontSize: 10, cursor: 'pointer', letterSpacing: 1 },
};
