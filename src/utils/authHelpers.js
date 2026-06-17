/**
 * Builds the payload sent to POST /api/auth/google from a Firebase user.
 */
export function buildGoogleAuthPayload(firebaseUser, idToken) {
  return {
    name: firebaseUser.displayName,
    email: firebaseUser.email,
    img: firebaseUser.photoURL,
    googleId: firebaseUser.uid,
    idToken,
  }
}

const FIREBASE_AUTH_ERRORS = {
  'auth/unauthorized-domain':
    'This site is not authorized for Google Sign-In. Add teleprt.com in Firebase Console → Authentication → Authorized domains.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'The sign-in popup was blocked. Allow popups for this site and try again.',
  'auth/popup-blocked-by-browser': 'The sign-in popup was blocked by your browser.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/operation-not-allowed': 'Google Sign-In is not enabled in Firebase Authentication.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
}

/**
 * Extracts a user-friendly error message from an axios or Firebase auth error.
 */
export function getAuthErrorMessage(err, fallback = 'Authentication failed.') {
  const firebaseCode = err?.code
  if (firebaseCode && FIREBASE_AUTH_ERRORS[firebaseCode]) {
    return FIREBASE_AUTH_ERRORS[firebaseCode]
  }
  if (firebaseCode?.startsWith('auth/')) {
    return err.message || fallback
  }

  const data = err?.response?.data
  if (typeof data?.message === 'string' && data.message.length > 0) {
    return data.message
  }
  if (typeof data === 'string' && data.length > 0) {
    return data
  }
  return fallback
}
