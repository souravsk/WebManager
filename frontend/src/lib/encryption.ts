/**
 * Simple encryption/decryption utilities for sensitive data
 * In production, use proper encryption libraries and backend storage
 */

const ENCRYPTION_KEY = 'devops-dashboard-encryption-key-2024'; // In production, use env variable

/**
 * Simple XOR-based encryption (NOT SECURE FOR PRODUCTION)
 * This is just for demonstration. In production, use proper encryption
 * and store sensitive data on the backend, not in localStorage.
 */
export function encrypt(text: string): string {
  try {
    // Use btoa for simple encoding + XOR
    const encoded = btoa(text);
    let result = '';
    for (let i = 0; i < encoded.length; i++) {
      result += String.fromCharCode(
        encoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return btoa(result);
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

/**
 * Decrypt data encrypted with the encrypt function
 */
export function decrypt(encryptedText: string): string {
  try {
    const decoded = atob(encryptedText);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return atob(result);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Mask sensitive data for display (never show the actual value)
 */
export function maskPrivateKey(key: string): string {
  if (!key || key.length < 20) return '••••••••••••••••';
  return `${key.substring(0, 10)}${'•'.repeat(key.length - 20)}${key.substring(key.length - 10)}`;
}
