// src/services/shareService.ts
import { Share } from 'react-native';
import type { Fragrance } from './fragranceService';

// Share a single fragrance
export async function shareFragrance(fragrance: Fragrance): Promise<void> {
  const stars = '★'.repeat(fragrance.longevity) + '☆'.repeat(5 - fragrance.longevity);
  const message = [
    `${fragrance.name} by ${fragrance.house}`,
    `${fragrance.type} · Longevity: ${stars}`,
    '',
    `Notes: ${fragrance.topNotes} → ${fragrance.heartNotes} → ${fragrance.baseNotes}`,
    '',
    `"${fragrance.description}"`,
    '',
    `Discovered via Scentia — The Art of Personal Fragrance`,
    `https://scentia.app`,
  ].join('\n');

  await Share.share({
    message,
    title: `${fragrance.name} — Scentia`,
  });
}

// Share multiple results
export async function shareResults(fragrances: Fragrance[], notes: string[]): Promise<void> {
  const noteList = notes.slice(0, 5).join(', ');
  const fragList = fragrances.map(f => `• ${f.name} by ${f.house}`).join('\n');

  const message = [
    `My Scentia fragrance matches for: ${noteList || 'my profile'}`,
    '',
    fragList,
    '',
    `Find your perfect scent at scentia.app`,
  ].join('\n');

  await Share.share({
    message,
    title: 'My Scentia Fragrance Matches',
  });
}

// Share referral code
export async function shareReferral(code: string, displayName: string): Promise<void> {
  const message = [
    `${displayName} is inviting you to Scentia — The Art of Personal Fragrance 🌸`,
    '',
    `Use code ${code} to get 1 month Premium free!`,
    '',
    `Download: https://scentia.app/invite/${code}`,
  ].join('\n');

  await Share.share({
    message,
    title: 'Join me on Scentia',
  });
}
