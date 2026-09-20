// src/services/fragranceService.ts
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  deleteDoc, query, where, orderBy, limit,
  serverTimestamp, increment, updateDoc, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Accord {
  name: string;
  percentage: number;
}

export interface Review {
  reviewer: string;
  rating: number;
  text: string;
}

export interface Fragrance {
  id?: string;
  name: string;
  house: string;
  type: 'Niche' | 'Designer';
  longevity: number;
  longevityLabel: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  accords: Accord[];
  description: string;
  reviews: Review[];
  savedAt?: Timestamp;
  searchParams?: SearchParams;
}

export interface SearchParams {
  notes: string[];
  intensities: Record<string, number>;
  preference: string;
  season: string;
}

export interface SearchHistory {
  id?: string;
  uid: string;
  params: SearchParams;
  results: Fragrance[];
  createdAt: Timestamp;
}

// ── FAVORITES ────────────────────────────────────────────────
export async function saveFavorite(uid: string, fragrance: Fragrance): Promise<string> {
  const ref = collection(db, 'users', uid, 'favorites');
  const docRef = await addDoc(ref, {
    ...fragrance,
    savedAt: serverTimestamp(),
  });
  // increment counter on user doc
  await updateDoc(doc(db, 'users', uid), { favoritesCount: increment(1) });
  return docRef.id;
}

export async function removeFavorite(uid: string, favoriteId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'favorites', favoriteId));
  await updateDoc(doc(db, 'users', uid), { favoritesCount: increment(-1) });
}

export async function getFavorites(uid: string): Promise<Fragrance[]> {
  const q = query(
    collection(db, 'users', uid, 'favorites'),
    orderBy('savedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Fragrance));
}

export async function isFavorited(uid: string, fragranceName: string, house: string): Promise<string | null> {
  const q = query(
    collection(db, 'users', uid, 'favorites'),
    where('name', '==', fragranceName),
    where('house', '==', house),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}

// ── SEARCH HISTORY ────────────────────────────────────────────
export async function saveSearchHistory(uid: string, params: SearchParams, results: Fragrance[]): Promise<void> {
  const ref = collection(db, 'users', uid, 'searches');
  await addDoc(ref, {
    uid,
    params,
    results,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', uid), { searchCount: increment(1) });
}

export async function getSearchHistory(uid: string, limitCount = 10): Promise<SearchHistory[]> {
  const q = query(
    collection(db, 'users', uid, 'searches'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SearchHistory));
}

// ── GLOBAL FRAGRANCE CATALOG (admin managed) ─────────────────
export async function getCatalogFragrance(id: string): Promise<Fragrance | null> {
  const snap = await getDoc(doc(db, 'catalog', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Fragrance) : null;
}

export async function getPopularFragrances(limitCount = 20): Promise<Fragrance[]> {
  const q = query(
    collection(db, 'catalog'),
    orderBy('saveCount', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Fragrance));
}
