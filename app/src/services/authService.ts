// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
  subscription: 'free' | 'premium';
  favoritesCount: number;
  searchCount: number;
}

// ── REGISTER ─────────────────────────────────────────────────
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await createUserProfile(user, displayName);
  return user;
}

// ── LOGIN ─────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

// ── GOOGLE LOGIN ──────────────────────────────────────────────
export async function loginWithGoogle(idToken: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(idToken);
  const { user } = await signInWithCredential(auth, credential);
  const exists = await userProfileExists(user.uid);
  if (!exists) await createUserProfile(user, user.displayName || 'User');
  return user;
}

// ── APPLE LOGIN ───────────────────────────────────────────────
export async function loginWithApple(identityToken: string, nonce: string): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({ idToken: identityToken, rawNonce: nonce });
  const { user } = await signInWithCredential(auth, credential);
  const exists = await userProfileExists(user.uid);
  if (!exists) await createUserProfile(user, user.displayName || 'Scentia User');
  return user;
}

// ── LOGOUT ───────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await signOut(auth);
}

// ── PASSWORD RESET ────────────────────────────────────────────
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ── PROFILE HELPERS ───────────────────────────────────────────
async function createUserProfile(user: User, displayName: string): Promise<void> {
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName,
    photoURL: user.photoURL || undefined,
    createdAt: serverTimestamp(),
    subscription: 'free',
    favoritesCount: 0,
    searchCount: 0,
  };
  await setDoc(doc(db, 'users', user.uid), profile);
}

async function userProfileExists(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists();
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}
