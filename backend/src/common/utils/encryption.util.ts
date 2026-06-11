import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

export class EncryptionUtil {
  private static getKey(): Buffer {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) {
      throw new Error('ENCRYPTION_KEY environment variable is not defined');
    }
    // Must be 32 bytes (64 hex characters)
    return Buffer.from(keyHex, 'hex');
  }

  /**
   * Encrypt a plain text string using AES-256-GCM
   */
  static encrypt(text: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Combine iv, authTag and encrypted data into a single string separated by colons
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt an AES-256-GCM encrypted string
   */
  static decrypt(encryptedText: string): string {
    const key = this.getKey();
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash a string using SHA-256 (for API secrets, etc.)
   */
  static hashSha256(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Compare a plain text with SHA-256 hash
   */
  static compareSha256(text: string, hash: string): boolean {
    return this.hashSha256(text) === hash;
  }
}
