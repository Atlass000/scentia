// src/utils/errorUtils.ts

// Map Firebase auth error codes → friendly Turkish/English messages
export function parseAuthError(error: any): string {
  const code = error?.code || '';
  const map: Record<string, string> = {
    'auth/invalid-credential':       'Incorrect email or password.',
    'auth/email-already-in-use':     'This email is already registered.',
    'auth/weak-password':            'Password must be at least 6 characters.',
    'auth/user-not-found':           'No account found with this email.',
    'auth/wrong-password':           'Incorrect password.',
    'auth/too-many-requests':        'Too many attempts. Please try again later.',
    'auth/network-request-failed':   'No internet connection. Check your network.',
    'auth/user-disabled':            'This account has been disabled.',
    'auth/invalid-email':            'Please enter a valid email address.',
  };
  return map[code] || error?.message || 'Something went wrong. Please try again.';
}

// Map Firestore / Cloud Function errors
export function parseFirestoreError(error: any): string {
  const code = error?.code || '';
  const map: Record<string, string> = {
    'unavailable':           'No internet connection. Check your network.',
    'unauthenticated':       'Please sign in to continue.',
    'permission-denied':     'You do not have permission for this action.',
    'resource-exhausted':    error?.message || 'Usage limit reached. Please upgrade.',
    'not-found':             'The requested content was not found.',
    'internal':              'Server error. Please try again later.',
    'deadline-exceeded':     'Request timed out. Please try again.',
  };
  return map[code] || error?.message || 'Something went wrong. Please try again.';
}

// Generic network check
export function isNetworkError(error: any): boolean {
  const msg = (error?.message || '').toLowerCase();
  return msg.includes('network') || msg.includes('internet') || msg.includes('offline') || error?.code === 'unavailable';
}
