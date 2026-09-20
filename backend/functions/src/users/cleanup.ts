// backend/functions/src/users/cleanup.ts
import * as functions from 'firebase-functions/v2/auth';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';

// Delete all user data when account is deleted
export const onUserDeleted = functions.beforeUserDeleted(async (event) => {
  const uid = event.data.uid;
  const db = admin.firestore();
  const batch = db.batch();

  try {
    // Delete favorites subcollection
    const favorites = await db.collection(`users/${uid}/favorites`).listDocuments();
    favorites.forEach((doc) => batch.delete(doc));

    // Delete search history
    const searches = await db.collection(`users/${uid}/searches`).listDocuments();
    searches.forEach((doc) => batch.delete(doc));

    // Delete user document
    batch.delete(db.doc(`users/${uid}`));

    await batch.commit();
    logger.info(`Cleaned up data for deleted user: ${uid}`);
  } catch (err) {
    logger.error('onUserDeleted cleanup error:', err);
  }
});

// backend/functions/src/users/triggers.ts — in same file for brevity
