# Scentia — Tam Kurulum ve Yayın Rehberi

## Proje Yapısı

```
scentia/
├── app/                     Mobil uygulama (React Native + Expo)
│   ├── app/(auth)/          Welcome, Login, Register, Forgot
│   ├── app/(tabs)/          Home, Finder, Favorites, Profile
│   ├── app/checkout.tsx     Stripe ödeme (3 plan)
│   ├── app/results.tsx      AI parfüm sonuçları
│   └── src/
│       ├── services/        Firebase, AI, Stripe, Affiliate
│       ├── store/           Zustand global state
│       ├── hooks/           Plan limitleri
│       ├── components/      FragranceCard
│       └── theme/           Renkler, tipografi
├── backend/
│   └── functions/src/
│       ├── ai/              Anthropic API (server-side, güvenli)
│       ├── payments/        Stripe webhook + abonelikler
│       └── users/           Firestore trigger'lar
├── admin/src/pages/
│   ├── index.tsx            Dashboard
│   ├── users.tsx            Kullanıcı yönetimi
│   ├── catalog.tsx          Parfüm kataloğu
│   ├── orders.tsx           Abonelikler + MRR
│   └── analytics.tsx        Büyüme grafikleri
└── README.md
```

---

## ADIM 1 — Firebase (15 dakika)

1. https://console.firebase.google.com → Add project → isim: **scentia-app**

2. **Authentication** → Get started → Email/Password ve Google aktif et

3. **Firestore** → Create database → Production mode → us-central1

4. **Upgrade to Blaze** (Functions için zorunlu — ücretsiz tier çok cömert)

5. Project Settings ⚙️ → Your apps → Web → Config al → `app/.env.local` dosyasına yapıştır

6. Terminal:
```bash
npm install -g firebase-tools
firebase login
firebase use --add   # scentia-app seç
```

---

## ADIM 2 — Anthropic API Key (2 dakika)

```bash
# https://console.anthropic.com → API Keys → Create key
firebase functions:secrets:set ANTHROPIC_API_KEY
```

---

## ADIM 3 — Stripe (20 dakika)

1. https://dashboard.stripe.com → Developers → API Keys
   - Publishable key → `app/.env.local`
   - Secret key:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
```

2. Products → 3 ürün oluştur, Price ID'leri `.env.local`'a koy:
   - Essential: $4.99/ay
   - Premium: $9.99/ay
   - Premium Yearly: $59.99/yıl

3. Backend deploy'dan sonra Webhook ekle (bkz. Adım 4)

---

## ADIM 4 — Backend Deploy (5 dakika)

```bash
cd backend
npm install && npm run build

cd ..
firebase deploy --only firestore
firebase deploy --only functions
```

Sonra Stripe webhook URL'i ekle:
`https://us-central1-scentia-app.cloudfunctions.net/stripeWebhook`

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

---

## ADIM 5 — Uygulamayı Test Et

```bash
cd app
npm install
cp .env.example .env.local   # Değerleri doldur

npx expo start
# iOS: 'i'   Android: 'a'   Telefon: QR tara (Expo Go)
```

---

## ADIM 6 — App Store (iOS)

Apple Developer hesabı gerekli: https://developer.apple.com ($99/yıl)

```bash
npm install -g eas-cli
eas login
cd app
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

App Store Connect'te (https://appstoreconnect.apple.com):
- Açıklama, ekran görüntüleri, kategori doldur
- Submit for Review → 24-48 saat

---

## ADIM 7 — Play Store (Android)

Google Play hesabı gerekli: https://play.google.com/console ($25 tek seferlik)

```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

---

## ADIM 8 — Admin Panel

```bash
cd admin
npm install
cp .env.example .env.local   # Firebase değerlerini doldur
npm run dev                   # localhost:3001

# Yayınlamak için:
npm install -g vercel
vercel --prod
```

---

## Amazon Affiliate Kurulumu

1. https://affiliate-program.amazon.com → Kayıt ol → Tracking ID al
2. `app/src/services/affiliateService.ts` dosyasını aç:
```typescript
const AMAZON_TAG = 'SENIN-TAG-20';  // ← buraya koy
```

---

## Tahmini Gelir

| Kullanıcı | Essential %5 | Premium %3 | Affiliate | Toplam |
|-----------|-------------|-----------|-----------|--------|
| 500 | $125 | $150 | $50 | **$325/ay** |
| 2.000 | $499 | $599 | $200 | **$1.300/ay** |
| 5.000 | $1.248 | $1.499 | $500 | **$3.250/ay** |

---

## Tahmini Maliyet (1000 kullanıcı)

| Servis | Maliyet |
|--------|---------|
| Firebase | ~$5/ay |
| Anthropic API | ~$20/ay |
| Stripe (2.9% + $0.30) | Satıştan |
| Expo EAS | $0-29/ay |
| **Toplam** | **~$25-54/ay** |
