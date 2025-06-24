// utils/secureLinkHandler.ts
import CryptoJS from 'crypto-js';

// Types for post data
interface PostData {
  postId: number | string;
}

interface StoryData {
  postId: number | string;
}

interface DecryptedData {
  type: string;
  id: string;
}

class SecureLinkHandler {
  // Simple fixed keys - Change these in production!
  private static readonly _key: string = 'YourSecureKeyHere32CharactersLong'; // 32 chars
  private static readonly _iv: string = 'YourSecureIvHere'; // 16 chars
  private static readonly _separator: string = ':::'; // Unique separator
  public static readonly baseUrl: string = 'https://bigshorts.social';

  /**
   * Encrypts data using Flutter's fallback method only
   * Flutter fallback: base64UrlEncode(utf8.encode('$type$_separator$id'))
   */
  static _encryptData(type: string, id: string): string {
    try {
      // Use Flutter's fallback method directly
      // Flutter: base64UrlEncode(utf8.encode('$type$_separator$id'))
      const fallbackData = `${type}${this._separator}${id}`;
      
      // Convert string to bytes then to base64 (matching Flutter's utf8.encode)
      const fallbackBytes = CryptoJS.enc.Utf8.parse(fallbackData);
      const fallbackBase64 = CryptoJS.enc.Base64.stringify(fallbackBytes);
      
      // Make URL safe (matching Flutter's base64UrlEncode)
      return fallbackBase64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        
    } catch (e: unknown) {
      console.error('Fallback encryption error:', e instanceof Error ? e.message : String(e));
      // If even fallback fails, return basic encoding
      const basicData = `${type}${this._separator}${id}`;
      return btoa(basicData)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    }
  }

  /**
   * Decodes a secure link - handles both AES and fallback methods
   */
  static decodeSecureLink(encoded: string): DecryptedData | null {
    try {
      // Convert URL-safe Base64 back to standard Base64
      let base64String = encoded;
      
      // Replace URL-safe characters with standard Base64 characters
      base64String = base64String.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      while (base64String.length % 4 !== 0) {
        base64String += '=';
      }

      // FIRST: Try fallback decoding (since we're now using fallback for encryption)
      try {
        // This matches the fallback: utf8.decode(base64Url.decode(encoded))
        const decoded = CryptoJS.enc.Base64.parse(base64String).toString(CryptoJS.enc.Utf8);
        
        if (decoded.includes(this._separator)) {
          const parts = decoded.split(this._separator);
          if (parts.length >= 2) {
            return {
              type: parts[0],
              id: parts[1],
            };
          }
        }
      } catch (fallbackError) {
        // If fallback fails, try AES (for older tokens)
      }

      // SECOND: Try AES decryption (for backwards compatibility with older tokens)
      try {
        // Create key and IV exactly like encryption
        const key = CryptoJS.enc.Utf8.parse(this._key);
        const iv = CryptoJS.enc.Utf8.parse(this._iv);
        
        // Parse the base64 to get encrypted bytes
        const encryptedBytes = CryptoJS.enc.Base64.parse(base64String);
        
        // Create cipher params for decryption
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: encryptedBytes
        });
        
        // Decrypt using same settings as encryption
        const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });

        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedStr) {
          throw new Error('Decryption failed - empty result');
        }
        
        const data = JSON.parse(decryptedStr);
        
        return {
          type: data.type,
          id: data.id,
        };
      } catch (aesError) {
        // Both methods failed
        console.error('Both AES and fallback decoding failed');
        console.error('AES error:', aesError);
        return null;
      }
    } catch (e: unknown) {
      console.error('Decoding error:', e instanceof Error ? e.message : String(e));
      return null;
    }
  }
}

// Extension-like functions for different post types
export const generatePostShareLink = (postId: string): string => {
  const token = SecureLinkHandler._encryptData('flix', postId.toString());
  return `Watch non-stop interactive videos on Bigshorts, India's first interactive platform - ${SecureLinkHandler.baseUrl}/s/${token}`;
};

export const generateLongFormShareLink = (postId: string): string => {
  const token = SecureLinkHandler._encryptData('longform', postId.toString());
  return `Watch non-stop interactive videos on Bigshorts, India's first interactive platform - ${SecureLinkHandler.baseUrl}/s/${token}`;
};

export const generateStoryShareLink = (storyData: StoryData): string => {
  const token = SecureLinkHandler._encryptData('snip', storyData.postId.toString());
  return `Check out this Ssup on Bigshorts - ${SecureLinkHandler.baseUrl}/s/${token}`;
};

// Export types for use in other files
export type { PostData, StoryData, DecryptedData };

export default SecureLinkHandler;