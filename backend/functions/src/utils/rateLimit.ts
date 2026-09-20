// backend/functions/src/utils/rateLimit.ts
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

const LIMITS = {
  free:      { daily: 5,   monthly: 3  },
  essential: { daily: 10,  monthly: 20 },
  premium:   { daily: 100, monthly: Infinity },
};

export async function checkAndIncrementUsage(uid: string): Promise<void> {
  const db = admin.firestore();
  const userRef = db.doc(`users/${uid}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data();
    if (!data) throw new Error('User not found');

    const plan = (data.subscription as string) || 'free';
    const limit = LIMITS[plan as keyof typeof LIMITS] || LIMITS.free;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayKey = now.toISOString().split('T')[0];

    const monthlyCount = data.monthKey === monthKey ? (data.monthlySearchCount || 0) : 0;
    const dailyCount   = data.todayKey  === todayKey  ? (data.dailySearchCount  || 0) : 0;

    if (monthlyCount >= limit.monthly) {
      throw Object.assign(new Error('Monthly search limit reached'), { code: 'MONTHLY_LIMIT' });
    }
    if (dailyCount >= limit.daily) {
      throw Object.assign(new Error('Daily search limit reached'), { code: 'DAILY_LIMIT' });
    }

    tx.update(userRef, {
      monthKey,
      todayKey,
      monthlySearchCount: monthlyCount + 1,
      dailySearchCount:   dailyCount   + 1,
      searchCount: admin.firestore.FieldValue.increment(1),
    });
  });
}
