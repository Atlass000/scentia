// backend/functions/src/index.ts
import * as admin from 'firebase-admin';
admin.initializeApp();

export { findFragrances } from './ai/findFragrances';
export { createSubscription, cancelSubscription, getSubscriptionStatus, stripeWebhook } from './payments/stripe';
export { onUserDeleted } from './users/cleanup';
export { onNewFavorite } from './users/triggers';
export { sendWeeklyRecommendations, sendReEngagementPush, sendManualPush } from './notifications/push';
