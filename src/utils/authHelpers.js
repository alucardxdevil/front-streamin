/**
 * Builds the payload sent to POST /api/auth/google from a Firebase user.
 */
export function buildGoogleAuthPayload(firebaseUser) {
  return {
    name: firebaseUser.displayName,
    email: firebaseUser.email,
    img: firebaseUser.photoURL,
    googleId: firebaseUser.uid,
  }
}

/**
 * Extracts a user-friendly error message from an axios error.
 */
export function getAuthErrorMessage(err, fallback = 'Authentication failed.') {
  const data = err?.response?.data
  if (typeof data?.message === 'string' && data.message.length > 0) {
    return data.message
  }
  if (typeof data === 'string' && data.length > 0) {
    return data
  }
  return fallback
}
