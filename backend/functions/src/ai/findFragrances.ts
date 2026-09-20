// backend/functions/src/ai/findFragrances.ts
import * as functions from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { checkAndIncrementUsage } from '../utils/rateLimit';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SearchParamsSchema = z.object({
  notes: z.array(z.string()).max(30),
  intensities: z.record(z.number().min(1).max(10)),
  preference: z.enum(['both', 'niche', 'designer']),
  season: z.enum(['any', 'spring', 'summer', 'autumn', 'winter']),
});

const FragranceSchema = z.object({
  name: z.string(),
  house: z.string(),
  type: z.enum(['Niche', 'Designer']),
  longevity: z.number().min(1).max(5),
  longevityLabel: z.string(),
  topNotes: z.string(),
  heartNotes: z.string(),
  baseNotes: z.string(),
  accords: z.array(z.object({ name: z.string(), percentage: z.number() })),
  description: z.string(),
  reviews: z.array(z.object({ reviewer: z.string(), rating: z.number(), text: z.string() })),
});

export const findFragrances = functions.onCall(
  { timeoutSeconds: 60, memory: '256MiB', region: 'us-central1', secrets: ['ANTHROPIC_API_KEY'] },
  async (request) => {
    if (!request.auth) throw new functions.HttpsError('unauthenticated', 'Must be signed in');

    // Rate limiting — checks plan limits and increments counter
    try {
      await checkAndIncrementUsage(request.auth.uid);
    } catch (err: any) {
      if (err.code === 'MONTHLY_LIMIT')
        throw new functions.HttpsError('resource-exhausted', 'Monthly search limit reached. Upgrade to continue.');
      if (err.code === 'DAILY_LIMIT')
        throw new functions.HttpsError('resource-exhausted', 'Daily limit reached. Try again tomorrow.');
      throw new functions.HttpsError('internal', 'Usage check failed');
    }

    const parsed = SearchParamsSchema.safeParse(request.data?.params);
    if (!parsed.success) throw new functions.HttpsError('invalid-argument', 'Invalid parameters');

    const { notes, intensities, preference, season } = parsed.data;
    const intensityStr = Object.entries(intensities).map(([k, v]) => `${k}: ${v}/10`).join(', ');
    const typeStr = preference === 'both' ? 'both niche and designer' : preference === 'niche' ? 'niche only' : 'designer only';

    const prompt = `You are a master perfumer at Scentia, a luxury fragrance discovery platform.

Customer preferences:
- Favorite notes: ${notes.length > 0 ? notes.join(', ') : 'No specific notes — suggest based on the intensity profile'}
- Intensity profile: ${intensityStr}
- Fragrance type: ${typeStr}
- Season: ${season === 'any' ? 'All seasons' : season}

Recommend exactly 3 real, existing fragrances. Return ONLY a JSON array, no markdown:
[{"name":"","house":"","type":"Niche or Designer","longevity":1-5,"longevityLabel":"Very long lasting|Long lasting|Moderate|Light|Evanescent","topNotes":"","heartNotes":"","baseNotes":"","accords":[{"name":"","percentage":0}],"description":"2-3 sentence poetic perfumer note","reviews":[{"reviewer":"","rating":1-5,"text":""},{"reviewer":"","rating":1-5,"text":""},{"reviewer":"","rating":1-5,"text":""}]}]

Include 3-5 accords. Reviews should sound like real Fragrantica community reviews.`;

    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = message.content
        .filter(b => b.type === 'text')
        .map(b => (b as any).text)
        .join('');
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const fragrances = JSON.parse(clean).map((item: unknown) => {
        const r = FragranceSchema.safeParse(item);
        if (!r.success) throw new Error('Invalid AI response format');
        return r.data;
      });

      logger.info(`findFragrances: ${fragrances.length} results for uid=${request.auth.uid}`);
      return { fragrances };
    } catch (err) {
      logger.error('findFragrances error:', err);
      throw new functions.HttpsError('internal', 'Failed to generate recommendations');
    }
  }
);
