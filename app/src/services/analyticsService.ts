// src/services/analyticsService.ts
// Firebase Analytics event tracking — tüm önemli kullanıcı aksiyonları

// NOT: Expo ile Firebase Analytics için @react-native-firebase/analytics kullanılmalı.
// Web SDK'da Analytics desteği sınırlı, bu yüzden native modül tercih edilir.
// Kurulum: expo install @react-native-firebase/analytics

let analytics: any = null;

async function getAnalytics() {
  if (analytics) return analytics;
  try {
    const mod = await import('@react-native-firebase/analytics');
    analytics = mod.default();
  } catch {
    // Analytics not installed — log to console in dev
    analytics = {
      logEvent: (name: string, params: object) => {
        if (__DEV__) console.log(`[Analytics] ${name}`, params);
      },
      setUserProperties: (props: object) => {
        if (__DEV__) console.log(`[Analytics] setUserProperties`, props);
      },
      setUserId: (id: string) => {
        if (__DEV__) console.log(`[Analytics] setUserId`, id);
      },
      logScreenView: (params: object) => {
        if (__DEV__) console.log(`[Analytics] screenView`, params);
      },
    };
  }
  return analytics;
}

// ── USER EVENTS ──────────────────────────────────────────────
export async function trackSignUp(method: 'email' | 'google' | 'apple') {
  const a = await getAnalytics();
  await a.logEvent('sign_up', { method });
}

export async function trackLogin(method: 'email' | 'google' | 'apple') {
  const a = await getAnalytics();
  await a.logEvent('login', { method });
}

export async function trackOnboardingComplete(families: string[], pref: string) {
  const a = await getAnalytics();
  await a.logEvent('onboarding_complete', { families: families.join(','), pref });
}

// ── SEARCH EVENTS ────────────────────────────────────────────
export async function trackSearch(params: {
  noteCount: number;
  preference: string;
  season: string;
  resultCount: number;
}) {
  const a = await getAnalytics();
  await a.logEvent('fragrance_search', params);
}

export async function trackResultView(fragranceName: string, house: string) {
  const a = await getAnalytics();
  await a.logEvent('view_fragrance', { fragrance_name: fragranceName, house });
}

// ── ENGAGEMENT EVENTS ─────────────────────────────────────────
export async function trackSaveFavorite(fragranceName: string, house: string, type: string) {
  const a = await getAnalytics();
  await a.logEvent('save_favorite', { fragrance_name: fragranceName, house, type });
}

export async function trackAffiliateClick(store: string, fragranceName: string) {
  const a = await getAnalytics();
  await a.logEvent('affiliate_click', { store, fragrance_name: fragranceName });
}

export async function trackShare(contentType: 'fragrance' | 'results' | 'referral') {
  const a = await getAnalytics();
  await a.logEvent('share', { content_type: contentType });
}

// ── REVENUE EVENTS ────────────────────────────────────────────
export async function trackSubscriptionStart(plan: string, price: number) {
  const a = await getAnalytics();
  await a.logEvent('purchase', {
    transaction_id: Date.now().toString(),
    value: price / 100,
    currency: 'USD',
    items: [{ item_id: plan, item_name: plan, price: price / 100 }],
  });
}

export async function trackPaywallView(source: 'limit_reached' | 'profile' | 'home') {
  const a = await getAnalytics();
  await a.logEvent('paywall_view', { source });
}

// ── SCREEN TRACKING ───────────────────────────────────────────
export async function trackScreen(screenName: string) {
  const a = await getAnalytics();
  await a.logScreenView({ screen_name: screenName, screen_class: screenName });
}

// ── USER PROPERTIES ───────────────────────────────────────────
export async function setUserProperties(uid: string, plan: string) {
  const a = await getAnalytics();
  await a.setUserId(uid);
  await a.setUserProperties({ subscription_plan: plan });
}
