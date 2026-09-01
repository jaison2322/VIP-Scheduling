// ─── Cryptographic Utilities for Password Hashing ─────────────────────────────
// Uses the standard Web Crypto API (supported natively across all modern browsers)

/**
 * Computes the SHA-256 hash of a plain text password.
 * @param password Plain text password string
 * @returns Hex string representation of the SHA-256 hash
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies if a plain text password matches a given hash.
 * @param password Plain text password string
 * @param hash Stored SHA-256 hash
 * @returns boolean indicating match
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}
