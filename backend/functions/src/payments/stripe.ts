// backend/functions/src/payments/stripe.ts
import * as functions from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
}

const OPTS = { region: 'us-central1' as const, secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] };

export const createSubscription = functions.onCall(OPTS, async (request) => {
  if (!request.auth) throw new functions.HttpsError('unauthenticated', 'Must be signed in');
  const stripe = getStripe();
  const { priceId } = request.data;
  const uid = request.auth.uid;
  try {
    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    const userData = userDoc.data();
    let customerId = userData?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: request.auth.token.email, metadata: { uid } });
      customerId = customer.id;
      await admin.firestore().doc(`users/${uid}`).update({ stripeCustomerId: customerId });
    }
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { uid, priceId },
    });
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    return { subscriptionId: subscription.id, clientSecret: paymentIntent.client_secret };
  } catch (err) {
    logger.error('createSubscription:', err);
    throw new functions.HttpsError('internal', 'Subscription creation failed');
  }
});

export const cancelSubscription = functions.onCall(OPTS, async (request) => {
  if (!request.auth) throw new functions.HttpsError('unauthenticated', 'Must be signed in');
  try {
    await getStripe().subscriptions.cancel(request.data.subscriptionId);
    await admin.firestore().doc(`users/${request.auth.uid}`).update({ subscription: 'free', stripeSubscriptionId: admin.firestore.FieldValue.delete() });
    return { success: true };
  } catch (err) {
    logger.error('cancelSubscription:', err);
    throw new functions.HttpsError('internal', 'Cancellation failed');
  }
});

export const getSubscriptionStatus = functions.onCall(OPTS, async (request) => {
  if (!request.auth) throw new functions.HttpsError('unauthenticated', 'Must be signed in');
  const data = (await admin.firestore().doc(`users/${request.auth.uid}`).get()).data();
  return { active: ['essential', 'premium'].includes(data?.subscription), plan: data?.subscription || 'free', expiresAt: data?.subscriptionExpiresAt?.toMillis?.() || null };
});

export const stripeWebhook = functions.onRequest({ ...OPTS, invoker: 'public' }, async (req, res) => {
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature']!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch { res.status(400).send('Signature failed'); return; }

  const db = admin.firestore();
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const uid = sub.metadata.uid;
    if (uid) {
      const priceId = sub.items.data[0]?.price.id || '';
      const essentialId = process.env.STRIPE_ESSENTIAL_PRICE_ID;
      const planName = priceId === essentialId ? 'essential' : 'premium';
      await db.doc(`users/${uid}`).update({ subscription: planName, stripeSubscriptionId: sub.id, subscriptionExpiresAt: admin.firestore.Timestamp.fromMillis(sub.current_period_end * 1000) });
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    if (sub.metadata.uid) await db.doc(`users/${sub.metadata.uid}`).update({ subscription: 'free' });
  }
  res.json({ received: true });
});
