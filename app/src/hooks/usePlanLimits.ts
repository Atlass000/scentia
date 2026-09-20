// src/hooks/usePlanLimits.ts
import { useAuthStore } from '../store';

export interface PlanLimits {
  maxSearchesPerMonth: number;
  maxFavorites: number;
  hasFullCatalog: boolean;
  hasSearchHistory: boolean;
  canSearch: boolean;
  isPremium: boolean;
  searchesLeft: number;
}

// Free: 3 searches/month, 5 favorites
// Essential ($4.99): 20 searches/month, unlimited favorites
// Premium ($9.99): unlimited everything
export function usePlanLimits(): PlanLimits {
  const { profile } = useAuthStore();

  const isPremium = profile?.subscription === 'premium';
  const isEssential = profile?.subscription === 'essential';
  const searchCount = profile?.monthlySearchCount ?? 0;

  if (isPremium) {
    return {
      maxSearchesPerMonth: Infinity,
      maxFavorites: Infinity,
      hasFullCatalog: true,
      hasSearchHistory: true,
      canSearch: true,
      isPremium: true,
      searchesLeft: Infinity,
    };
  }

  if (isEssential) {
    const left = Math.max(0, 20 - searchCount);
    return {
      maxSearchesPerMonth: 20,
      maxFavorites: Infinity,
      hasFullCatalog: false,
      hasSearchHistory: true,
      canSearch: left > 0,
      isPremium: false,
      searchesLeft: left,
    };
  }

  // Free plan
  const left = Math.max(0, 3 - searchCount);
  return {
    maxSearchesPerMonth: 3,
    maxFavorites: 5,
    hasFullCatalog: false,
    hasSearchHistory: false,
    canSearch: left > 0,
    isPremium: false,
    searchesLeft: left,
  };
}
