// src/services/affiliateService.ts
// Affiliate links — komisyon kazanmak için

export interface AffiliateLink {
  store: string;
  url: string;
  label: string;
  commission: string;
}

const AMAZON_TAG = 'scentia-20'; // Amazon Associates tag — kendi tag'ini gir
const NOTINO_TAG = 'scentia';    // Notino affiliate tag

// Fragrance name + house → affiliate search links
export function getAffiliateLinks(name: string, house: string): AffiliateLink[] {
  const query = encodeURIComponent(`${house} ${name} perfume`);
  const queryShort = encodeURIComponent(`${house} ${name}`);

  return [
    {
      store: 'Amazon',
      url: `https://www.amazon.com/s?k=${query}&tag=${AMAZON_TAG}`,
      label: 'Find on Amazon',
      commission: '3–8%',
    },
    {
      store: 'Notino',
      url: `https://www.notino.com/search/?phrase=${queryShort}&affilid=${NOTINO_TAG}`,
      label: 'Find on Notino',
      commission: '5–10%',
    },
    {
      store: 'FragranceNet',
      url: `https://www.fragrancenet.com/search?q=${queryShort}`,
      label: 'FragranceNet',
      commission: '8%',
    },
  ];
}

// Track affiliate click (for analytics)
export async function trackAffiliateClick(
  fragranceName: string,
  store: string,
  uid?: string
): Promise<void> {
  // Log to Firebase — implement after analytics setup
  console.log(`[Affiliate] ${store} click: ${fragranceName} by uid=${uid ?? 'anon'}`);
}
