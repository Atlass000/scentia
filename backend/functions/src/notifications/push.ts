// backend/functions/src/notifications/push.ts
import * as functions from 'firebase-functions/v2/https';
import * as scheduler from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  badge?: number;
  channelId?: string;
}

// ── EXPO PUSH SENDER ─────────────────────────────────────────
async function sendExpoPushNotifications(messages: ExpoPushMessage[]) {
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }
  for (const chunk of chunks) {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(chunk),
    });
    const data = await res.json() as any;
    logger.info('Expo push response:', JSON.stringify(data).slice(0, 200));
  }
}

// ── WEEKLY RECOMMENDATION PUSH ────────────────────────────────
// Runs every Monday at 10:00 AM UTC
export const sendWeeklyRecommendations = scheduler.onSchedule(
  { schedule: 'every monday 10:00', timeZone: 'UTC', region: 'us-central1' },
  async () => {
    const db = admin.firestore();
    const snap = await db.collection('users')
      .where('pushEnabled', '==', true)
      .where('expoPushToken', '!=', null)
      .limit(500)
      .get();

    if (snap.empty) { logger.info('No push tokens found'); return; }

    const WEEKLY_MESSAGES = [
      { title: 'Your weekly scent awaits ✦', body: 'New fragrance recommendations curated just for you.' },
      { title: 'A new discovery, every week.', body: 'Your Scentia picks for this week are ready.' },
      { title: 'What will you discover today?', body: 'Fresh fragrance matches are waiting in your Scentia.' },
      { title: 'The art of scent continues.', body: 'We have new recommendations tailored to your profile.' },
    ];
    const msg = WEEKLY_MESSAGES[new Date().getDate() % WEEKLY_MESSAGES.length];

    const messages: ExpoPushMessage[] = snap.docs
      .map(d => d.data().expoPushToken as string)
      .filter(Boolean)
      .map(token => ({
        to: token,
        title: msg.title,
        body: msg.body,
        sound: 'default',
        channelId: 'scentia-weekly',
        data: { type: 'weekly_recommendation', screen: 'finder' },
      }));

    await sendExpoPushNotifications(messages);
    logger.info(`Weekly push sent to ${messages.length} users`);
  }
);

// ── RE-ENGAGEMENT PUSH (inactive 7 days) ─────────────────────
export const sendReEngagementPush = scheduler.onSchedule(
  { schedule: 'every wednesday 14:00', timeZone: 'UTC', region: 'us-central1' },
  async () => {
    const db = admin.firestore();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const snap = await db.collection('users')
      .where('pushEnabled', '==', true)
      .where('expoPushToken', '!=', null)
      .where('lastActiveAt', '<', admin.firestore.Timestamp.fromDate(cutoff))
      .limit(200)
      .get();

    if (snap.empty) return;

    const messages: ExpoPushMessage[] = snap.docs
      .map(d => d.data().expoPushToken as string)
      .filter(Boolean)
      .map(token => ({
        to: token,
        title: 'Your signature scent is still out there.',
        body: 'Come back and let Scentia find it for you.',
        sound: 'default',
        data: { type: 're_engagement', screen: 'finder' },
      }));

    await sendExpoPushNotifications(messages);
    logger.info(`Re-engagement push sent to ${messages.length} users`);
  }
);

// ── MANUAL PUSH (admin callable) ─────────────────────────────
export const sendManualPush = functions.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) throw new functions.HttpsError('unauthenticated', 'Must be signed in');

    // Admin check
    const adminSnap = await admin.firestore().doc(`admins/${request.auth.uid}`).get();
    if (!adminSnap.exists) throw new functions.HttpsError('permission-denied', 'Admin only');

    const { title, body, targetUids } = request.data as { title: string; body: string; targetUids?: string[] };

    let tokens: string[] = [];
    if (targetUids && targetUids.length > 0) {
      const docs = await Promise.all(targetUids.map(uid => admin.firestore().doc(`users/${uid}`).get()));
      tokens = docs.map(d => d.data()?.expoPushToken).filter(Boolean);
    } else {
      const snap = await admin.firestore().collection('users').where('pushEnabled', '==', true).where('expoPushToken', '!=', null).limit(1000).get();
      tokens = snap.docs.map(d => d.data().expoPushToken).filter(Boolean);
    }

    const messages: ExpoPushMessage[] = tokens.map(token => ({
      to: token, title, body, sound: 'default',
    }));

    await sendExpoPushNotifications(messages);
    logger.info(`Manual push sent to ${messages.length} users`);
    return { sent: messages.length };
  }
);
