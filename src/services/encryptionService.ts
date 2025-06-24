// src/services/encryptionService.ts
import CryptoJS from 'crypto-js';
import pako from 'pako';

class EncryptionService {
  // Convert hex string to byte array
  static _hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Async method to get encryption key
  static async getEncryptionKey(): Promise<string | null> {
    return process.env.NEXT_PUBLIC_ENCRYPTION_KEY || null;
  }
  // src/services/encryptionService.ts
  // Add these methods to your existing EncryptionService class

  // Encrypt request data method
  static async encryptRequest(requestData: any): Promise<{
    isEncrypted: boolean;
    isCompressed: boolean;
    iv: string;
    data: string;
  }> {
    try {
      const encryptionKey = await this.getEncryptionKey();
      if (!encryptionKey) throw new Error("Encryption key is null or empty");

      const ivWords = CryptoJS.lib.WordArray.random(16);
      const ivHex = CryptoJS.enc.Hex.stringify(ivWords);
      const key = CryptoJS.enc.Utf8.parse(encryptionKey);

      const jsonString = JSON.stringify(requestData);
      // const useCompression = jsonString.length > 10000000000;

      let dataToEncrypt: Uint8Array;

      dataToEncrypt = new TextEncoder().encode(jsonString);


      const wordArray = this._uint8ArrayToWordArray(dataToEncrypt);

      const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
        iv: ivWords,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return {
        isEncrypted: true,
        isCompressed: false,
        iv: ivHex,
        data: encrypted.toString(),
      };
    } catch (e) {
      console.error("Encryption failed:", e);
      throw new Error(
        `Encryption failed: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }


  // Helper method to convert Uint8Array to WordArray
  private static _uint8ArrayToWordArray(u8arr: Uint8Array): CryptoJS.lib.WordArray {
    const words: number[] = [];
    for (let i = 0; i < u8arr.length; i += 4) {
      words.push(
        ((u8arr[i] || 0) << 24) |
        ((u8arr[i + 1] || 0) << 16) |
        ((u8arr[i + 2] || 0) << 8) |
        (u8arr[i + 3] || 0)
      );
    }
    return CryptoJS.lib.WordArray.create(words, u8arr.length);
  }

  // Decrypt response method
  static async decryptResponse(responseData: {
    iv?: string;
    data?: string;
    isCompressed?: boolean;
  }): Promise<any> {
    try {
      const ivHex = responseData.iv;
      const encryptedBase64 = responseData.data;
      const isCompressed = responseData.isCompressed ?? false;

      if (!ivHex || !encryptedBase64) {
        throw new Error("Missing IV or encrypted data");
      }
      // Convert IV from hex string to bytes
      const ivBytes = this._hexToBytes(ivHex);
      const iv = CryptoJS.lib.WordArray.create(ivBytes);

      // Get encryption key
      const encryptionKey = await this.getEncryptionKey();
      if (!encryptionKey) {
        throw new Error("Encryption key is null or empty");
      }

      const key = CryptoJS.enc.Utf8.parse(encryptionKey);

      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedBytes = this._wordArrayToUint8Array(decrypted);

      let finalBytes: Uint8Array;

      if (isCompressed) {
        try {
          // Decompress using pako (ZLib)
          finalBytes = pako.inflate(decryptedBytes);
        } catch (compressionError) {
          console.error("Decompression failed:", compressionError);
          throw new Error("Decompression failed");
        }
      } else {
        finalBytes = decryptedBytes;
      }

      const jsonString = new TextDecoder().decode(finalBytes);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Decryption failed:", e);
      throw new Error(`Decryption failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Helper method to convert WordArray to Uint8Array
  static _wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const bytes = new Uint8Array(sigBytes);

    for (let i = 0; i < sigBytes; i++) {
      bytes[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return bytes;
  }
}


export default EncryptionService;