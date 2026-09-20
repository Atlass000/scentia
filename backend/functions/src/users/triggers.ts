// backend/functions/src/users/triggers.ts
import * as functions from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';

// When a new favorite is saved, increment the catalog saveCount
export const onNewFavorite = functions.onDocumentCreated(
  'users/{uid}/favorites/{favId}',
  async (event) => {
    const data = event.data?.data();
    if (!data?.name || !data?.house) return;

    const db = admin.firestore();
    try {
      // Find matching catalog entry
      const q = await db.collection('catalog')
        .where('name', '==', data.name)
        .where('house', '==', data.house)
        .limit(1)
        .get();

      if (!q.empty) {
        await q.docs[0].ref.update({
          saveCount: admin.firestore.FieldValue.increment(1),
        });
        logger.info(`Incremented saveCount for ${data.name} by ${data.house}`);
      }
    } catch (err) {
      logger.error('onNewFavorite error:', err);
    }
  }
);
