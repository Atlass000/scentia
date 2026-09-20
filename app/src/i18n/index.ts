// src/i18n/index.ts
import { getLocales } from 'expo-localization';

type Locale = 'tr' | 'en';

const tr = {
  // Auth
  welcome_title: 'Kişisel Kokunun\nSanatı.',
  welcome_sub: 'Seni etkileyen kokuları anlayarak, dilini konuşan parfümleri buluyoruz.',
  create_account: 'Hesap Oluştur',
  sign_in: 'Giriş Yap',
  email: 'E-posta',
  password: 'Şifre',
  full_name: 'Ad Soyad',
  forgot_password: 'Şifremi Unuttum',
  sign_in_action: 'Giriş Yap →',
  create_action: 'Hesap Oluştur →',
  send_reset: 'Sıfırlama Linki Gönder →',
  no_account: 'Hesabın yok mu? ',
  create_one: 'Oluştur',
  already_account: 'Zaten hesabın var mı? ',
  // Finder
  finder_label: 'Parfüm Bulucu',
  finder_title: 'İmzanı\nOluştur.',
  step1_title: 'Nota Seç',
  step1_sub: 'Sevdiğin notlara dokun',
  step2_title: 'Yoğunluk Ayarla',
  step2_sub: 'Karakterini belirle',
  step3_title: 'Tercihler',
  step3_sub: 'Eşleşmeyi ince ayarla',
  discover_btn: 'Parfümlerimi Keşfet →',
  type_label: 'Tür',
  season_label: 'Mevsim',
  notes_selected: (n: number) => `${n} nota seçildi`,
  // Results
  your_matches: 'Eşleşmelerin',
  curated_for_you: 'Senin için\nözel seçim.',
  fragrances_matched: (n: number) => `${n} parfüm profilinle eşleşti`,
  new_search: 'Yeni Arama Başlat',
  // Fragrance card
  longevity: 'Kalıcılık',
  note_pyramid: 'Nota Piramidi',
  main_accords: 'Ana Akortlar',
  community_reviews: 'Kullanıcı Yorumları',
  find_fragrance: 'Bu Parfümü Bul →',
  hide_options: '↑ Seçenekleri Gizle',
  top: 'Üst',
  heart: 'Kalp',
  base: 'Baz',
  // Longevity labels
  very_long_lasting: 'Çok kalıcı',
  long_lasting: 'Kalıcı',
  moderate: 'Orta',
  light: 'Hafif',
  evanescent: 'Geçici',
  // Favorites
  favorites_label: 'Koleksiyonun',
  favorites_title: 'Kaydedilen\nparfümler.',
  no_favorites: 'Henüz favori yok',
  no_favorites_sub: 'Parfümleri keşfet ve seni etkileyenleri kaydet.',
  start_discovering: 'Keşfetmeye Başla',
  // Profile
  account_label: 'Hesap',
  push_notifications: 'Bildirimler',
  dark_mode: 'Karanlık Mod',
  light_mode: 'Açık Mod',
  follows_system: 'Sistem ayarlarını takip eder',
  search_history: 'Arama Geçmişi',
  privacy_policy: 'Gizlilik Politikası',
  terms: 'Kullanım Koşulları',
  contact_support: 'Destek',
  sign_out: 'Çıkış Yap',
  sign_out_confirm: 'Çıkış yapmak istediğinden emin misin?',
  // Plans
  plan_free: 'Ücretsiz',
  plan_essential: 'Essential',
  plan_premium: 'Premium',
  upgrade_cta: 'Yükselt',
  per_month: '/ ay',
  per_year: '/ yıl',
  cancel_anytime: 'İstediğin zaman iptal et.',
  // Errors
  err_fill_all: 'Lütfen tüm alanları doldurun.',
  err_password_short: 'Şifre en az 6 karakter olmalı.',
  err_no_internet: 'İnternet bağlantısı yok. Ağını kontrol et.',
  err_generic: 'Bir şeyler ters gitti. Lütfen tekrar dene.',
  err_limit: 'Aylık arama limitine ulaştın. Yükselt.',
  // Share
  share_fragrance: 'Parfümü Paylaş',
  share_results: 'Sonuçları Paylaş ↗',
};

const en: typeof tr = {
  welcome_title: 'The Art of\nPersonal Fragrance.',
  welcome_sub: 'Discover your signature scent through intelligent, personalized matching.',
  create_account: 'Create Account',
  sign_in: 'Sign In',
  email: 'Email',
  password: 'Password',
  full_name: 'Full Name',
  forgot_password: 'Forgot password?',
  sign_in_action: 'Sign In →',
  create_action: 'Create Account →',
  send_reset: 'Send Reset Link →',
  no_account: "Don't have an account? ",
  create_one: 'Create one',
  already_account: 'Already have an account? ',
  finder_label: 'Fragrance Finder',
  finder_title: 'Compose your\nSignature.',
  step1_title: 'Choose Notes',
  step1_sub: 'Tap to select what you love',
  step2_title: 'Set Intensity',
  step2_sub: 'Dial in the character',
  step3_title: 'Preferences',
  step3_sub: 'Fine-tune your match',
  discover_btn: 'Discover My Fragrances →',
  type_label: 'Type',
  season_label: 'Season',
  notes_selected: (n: number) => `${n} note${n !== 1 ? 's' : ''} selected`,
  your_matches: 'Your Matches',
  curated_for_you: 'Curated\nfor you.',
  fragrances_matched: (n: number) => `${n} fragrance${n !== 1 ? 's' : ''} matched your profile`,
  new_search: 'Start New Search',
  longevity: 'Longevity',
  note_pyramid: 'Note Pyramid',
  main_accords: 'Main Accords',
  community_reviews: 'Community Reviews',
  find_fragrance: 'Find this Fragrance →',
  hide_options: '↑ Hide options',
  top: 'Top',
  heart: 'Heart',
  base: 'Base',
  very_long_lasting: 'Very long lasting',
  long_lasting: 'Long lasting',
  moderate: 'Moderate',
  light: 'Light',
  evanescent: 'Evanescent',
  favorites_label: 'Your Collection',
  favorites_title: 'Saved\nfragrances.',
  no_favorites: 'No favorites yet',
  no_favorites_sub: 'Discover fragrances and save the ones that speak to you.',
  start_discovering: 'Start Discovering',
  account_label: 'Account',
  push_notifications: 'Push Notifications',
  dark_mode: 'Dark Mode',
  light_mode: 'Light Mode',
  follows_system: 'Follows system settings',
  search_history: 'Search History',
  privacy_policy: 'Privacy Policy',
  terms: 'Terms of Service',
  contact_support: 'Contact Support',
  sign_out: 'Sign Out',
  sign_out_confirm: 'Are you sure you want to sign out?',
  plan_free: 'Free',
  plan_essential: 'Essential',
  plan_premium: 'Premium',
  upgrade_cta: 'Upgrade',
  per_month: '/ month',
  per_year: '/ year',
  cancel_anytime: 'Cancel anytime.',
  err_fill_all: 'Please fill in all fields.',
  err_password_short: 'Password must be at least 6 characters.',
  err_no_internet: 'No internet connection. Check your network.',
  err_generic: 'Something went wrong. Please try again.',
  err_limit: 'Monthly search limit reached. Please upgrade.',
  share_fragrance: 'Share Fragrance',
  share_results: 'Share Results ↗',
};

const TRANSLATIONS = { tr, en };

function getLocale(): Locale {
  const locale = getLocales()[0]?.languageCode || 'en';
  return locale === 'tr' ? 'tr' : 'en';
}

// The t() function — use anywhere in the app
export function t<K extends keyof typeof en>(key: K, ...args: any[]): string {
  const locale = getLocale();
  const translations = TRANSLATIONS[locale] as typeof en;
  const val = translations[key] ?? en[key];
  if (typeof val === 'function') return (val as any)(...args);
  return val as string;
}

export const currentLocale = getLocale();
export const isTurkish = currentLocale === 'tr';
