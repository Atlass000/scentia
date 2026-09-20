// src/services/aiService.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { Fragrance, SearchParams } from './fragranceService';

interface FindFragrancesRequest {
  params: SearchParams;
}

interface FindFragrancesResponse {
  fragrances: Fragrance[];
}

// Calls the Cloud Function — Anthropic API key stays server-side (secure)
export async function findFragrances(params: SearchParams): Promise<Fragrance[]> {
  const fn = httpsCallable<FindFragrancesRequest, FindFragrancesResponse>(
    functions,
    'findFragrances'
  );
  const result = await fn({ params });
  return result.data.fragrances;
}

// Note categories and data
export const NOTE_CATEGORIES = [
  {
    id: 'floral',
    label: 'Floral',
    emoji: '🌸',
    notes: ['Rose', 'Jasmine', 'Iris', 'Peony', 'Violet', 'Lily', 'Orange Blossom', 'Ylang-Ylang', 'Tuberose', 'Gardenia'],
  },
  {
    id: 'woody',
    label: 'Woody',
    emoji: '🪵',
    notes: ['Sandalwood', 'Cedarwood', 'Oud', 'Vetiver', 'Patchouli', 'Guaiac Wood', 'Birch', 'Teak', 'Rosewood'],
  },
  {
    id: 'citrus',
    label: 'Citrus',
    emoji: '🍋',
    notes: ['Bergamot', 'Lemon', 'Grapefruit', 'Neroli', 'Mandarin', 'Yuzu', 'Lime', 'Petitgrain'],
  },
  {
    id: 'oriental',
    label: 'Oriental & Spicy',
    emoji: '✨',
    notes: ['Amber', 'Vanilla', 'Musk', 'Incense', 'Cardamom', 'Pepper', 'Saffron', 'Cinnamon', 'Benzoin'],
  },
  {
    id: 'fresh',
    label: 'Fresh & Aquatic',
    emoji: '🌊',
    notes: ['Sea Salt', 'Green Tea', 'Aquatic', 'Ozonic', 'Cucumber', 'Mint', 'Bamboo'],
  },
  {
    id: 'gourmand',
    label: 'Gourmand',
    emoji: '🍯',
    notes: ['Tonka Bean', 'Caramel', 'Coffee', 'Chocolate', 'Praline', 'Almond', 'Honey'],
  },
  {
    id: 'fougere',
    label: 'Fougère & Aromatic',
    emoji: '🌿',
    notes: ['Lavender', 'Oakmoss', 'Coumarin', 'Rosemary', 'Basil', 'Sage', 'Geranium'],
  },
  {
    id: 'chypre',
    label: 'Chypre',
    emoji: '🍃',
    notes: ['Labdanum', 'Cistus', 'Oakmoss', 'Bergamot', 'Castoreum'],
  },
];

export const INTENSITY_DIMENSIONS = [
  { id: 'freshness', label: 'Freshness', low: 'Subtle', high: 'Crisp' },
  { id: 'depth', label: 'Depth', low: 'Light', high: 'Deep' },
  { id: 'sweetness', label: 'Sweetness', low: 'Dry', high: 'Sweet' },
  { id: 'spiciness', label: 'Spiciness', low: 'Mild', high: 'Bold' },
  { id: 'woodiness', label: 'Woodiness', low: 'Soft', high: 'Dense' },
];
