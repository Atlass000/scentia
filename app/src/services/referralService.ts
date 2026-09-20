// src/services/referralService.ts
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ReferralData {
  code: string;
  uid: string;
  uses: number;
  maxUses: number;
  rewardDays: number;
  createdAt: any;
}

// Generate a unique referral code from user's uid
export function generateReferralCode(uid: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seed = uid.slice(-8);
  let code = 'SCT';
  for (let i = 0; i < 5; i++) {
    const charIndex = seed.charCodeAt(i % seed.length) % chars.length;
    code += chars[charIndex];
  }
  return code;
}

// Get or create referral code for user
export async function getOrCreateReferralCode(uid: string): Promise<string> {
  const ref = doc(db, 'referrals', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data().code;

  const code = generateReferralCode(uid);
  await setDoc(ref, {
    code,
    uid,
    uses: 0,
    maxUses: 50,
    rewardDays: 30, // 30 days free premium per referral
    createdAt: serverTimestamp(),
  });
  return code;
}

// Apply a referral code during registration
export async function applyReferralCode(code: string, newUserUid: string): Promise<{
  success: boolean;
  message: string;
  rewardDays?: number;
}> {
  // Find referral owner
  const q = query(collection(db, 'referrals'), where('code', '==', code.toUpperCase()), where('uses', '<', 50));
  const snap = await getDocs(q);

  if (snap.empty) return { success: false, message: 'Invalid or expired referral code.' };

  const referralDoc = snap.docs[0];
  const referral = referralDoc.data() as ReferralData;

  // Can't use your own code
  if (referral.uid === newUserUid) return { success: false, message: 'You cannot use your own referral code.' };

  // Apply reward to new user (30 days premium)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + referral.rewardDays);

  await updateDoc(doc(db, 'users', newUserUid), {
    subscription: 'premium',
    subscriptionExpiresAt: expiresAt,
    referredBy: referral.uid,
    referralCode: code,
  });

  // Apply reward to referrer too (30 days premium)
  const referrerDoc = await getDoc(doc(db, 'users', referral.uid));
  if (referrerDoc.exists()) {
    const referrerExpiry = referrerDoc.data().subscriptionExpiresAt?.toDate?.() || new Date();
    const newExpiry = new Date(Math.max(referrerExpiry.getTime(), Date.now()));
    newExpiry.setDate(newExpiry.getDate() + 30);
    await updateDoc(doc(db, 'users', referral.uid), {
      subscription: 'premium',
      subscriptionExpiresAt: newExpiry,
    });
  }

  // Increment use count
  await updateDoc(referralDoc.ref, { uses: increment(1) });

  return { success: true, message: `You get ${referral.rewardDays} days Premium free!`, rewardDays: referral.rewardDays };
}

// Get referral stats for profile screen
export async function getReferralStats(uid: string): Promise<{ code: string; uses: number; daysEarned: number }> {
  const snap = await getDoc(doc(db, 'referrals', uid));
  if (!snap.exists()) {
    const code = await getOrCreateReferralCode(uid);
    return { code, uses: 0, daysEarned: 0 };
  }
  const data = snap.data();
  return { code: data.code, uses: data.uses, daysEarned: data.uses * data.rewardDays };
}
