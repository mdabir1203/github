/**
 * Lenden Crypto Vault
 * Robust AES-GCM encryption for local-first sensitive data.
 * No dependencies, using native Web Crypto API.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Sovereign Key Generation (Simulates StrongBox)
 * Derives a non-exportable raw key from PBKDF2 for ultimate local sovereignty.
 */
async function getSovereignKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // CRITICAL: Not exportable (Hardware isolation simulation)
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data with Sovereign Trust
 */
export async function encrypt(text: string, pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await getSovereignKey(pin, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    new TextEncoder().encode(text)
  );
  
  // Storage logic...

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + IV_LENGTH);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts with Sovereign Trust
 */
export async function decrypt(encryptedBase64: string, pin: string): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(encryptedBase64)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

    const key = await getSovereignKey(pin, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    throw new Error('দয়া করে সঠিক পিন দিন (Invalid Decryption Key)');
  }
}

/**
 * Generates a verification hash for the PIN to check if it's correct without storing it.
 */
export async function generatePinHash(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}
