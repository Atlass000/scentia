// src/store/index.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../services/authService';
import type { Fragrance, SearchParams } from '../services/fragranceService';

// MMKV storage adapter for Zustand persist
const storage = new MMKV({ id: 'scentia-store' });
const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

// ── AUTH STORE ────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, profile: null, isLoading: false }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

// ── FINDER STORE ──────────────────────────────────────────────
interface FinderState {
  selectedNotes: string[];
  intensities: Record<string, number>;
  preference: 'both' | 'niche' | 'designer';
  season: 'any' | 'spring' | 'summer' | 'autumn' | 'winter';
  results: Fragrance[];
  isSearching: boolean;
  toggleNote: (note: string) => void;
  setIntensity: (dim: string, val: number) => void;
  setPreference: (pref: FinderState['preference']) => void;
  setSeason: (season: FinderState['season']) => void;
  setResults: (results: Fragrance[]) => void;
  setSearching: (searching: boolean) => void;
  reset: () => void;
  getSearchParams: () => SearchParams;
}

const DEFAULT_INTENSITIES = {
  freshness: 5, depth: 5, sweetness: 5, spiciness: 5, woodiness: 5,
};

export const useFinderStore = create<FinderState>()((set, get) => ({
  selectedNotes: [],
  intensities: DEFAULT_INTENSITIES,
  preference: 'both',
  season: 'any',
  results: [],
  isSearching: false,
  toggleNote: (note) =>
    set((s) => ({
      selectedNotes: s.selectedNotes.includes(note)
        ? s.selectedNotes.filter((n) => n !== note)
        : [...s.selectedNotes, note],
    })),
  setIntensity: (dim, val) =>
    set((s) => ({ intensities: { ...s.intensities, [dim]: val } })),
  setPreference: (preference) => set({ preference }),
  setSeason: (season) => set({ season }),
  setResults: (results) => set({ results }),
  setSearching: (isSearching) => set({ isSearching }),
  reset: () =>
    set({
      selectedNotes: [],
      intensities: DEFAULT_INTENSITIES,
      preference: 'both',
      season: 'any',
      results: [],
    }),
  getSearchParams: () => ({
    notes: get().selectedNotes,
    intensities: get().intensities,
    preference: get().preference,
    season: get().season,
  }),
}));

// ── FAVORITES STORE ───────────────────────────────────────────
interface FavoritesState {
  favorites: Fragrance[];
  setFavorites: (favs: Fragrance[]) => void;
  addFavorite: (fav: Fragrance) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (name: string, house: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      setFavorites: (favorites) => set({ favorites }),
      addFavorite: (fav) => set((s) => ({ favorites: [fav, ...s.favorites] })),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      isFavorite: (name, house) =>
        get().favorites.some((f) => f.name === name && f.house === house),
    }),
    {
      name: 'favorites-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
