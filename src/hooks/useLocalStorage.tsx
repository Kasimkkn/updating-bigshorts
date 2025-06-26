import { useEffect, useState } from "react";
import EncryptionService from "@/services/encryptionService";

type SetValue<T> = T | ((val: T) => T);
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: SetValue<T>) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      try {
        const parsed = JSON.parse(item);
        if (parsed && typeof parsed === 'object' && parsed.isEncrypted && parsed.iv && parsed.data) {
          // Return initialValue temporarily, real decryption happens in useEffect
          return initialValue;
        }
        return parsed;
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Error accessing localStorage for ${key}:`, error);
      return initialValue;
    }
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Async hydration to handle encrypted data
  useEffect(() => {
    const hydrateFromStorage = async () => {
      try {
        const item = localStorage.getItem(key);

        if (!item) {
          setIsHydrated(true);
          return;
        }

        try {
          const parsed = JSON.parse(item);

          if (parsed &&
            typeof parsed === 'object' &&
            parsed.isEncrypted &&
            parsed.iv &&
            parsed.data) {

            // Decrypt the data
            const decryptedData = await EncryptionService.decryptResponse(parsed);

            // 🔧 FIX: Handle the {valueToStore: "actual_value"} format
            let finalValue = decryptedData;

            // Check if decryptedData has the valueToStore property
            if (decryptedData &&
              typeof decryptedData === 'object' &&
              'valueToStore' in decryptedData) {
              finalValue = (decryptedData as any).valueToStore;
            }

            setStoredValue(finalValue);
          } else {
            // Not encrypted, use parsed data
            setStoredValue(parsed);
          }
        } catch (parseError) {
          // If parsing fails, use as plain text
          setStoredValue(item as T);
        }
      } catch (error) {
        console.error(`Error hydrating ${key}:`, error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateFromStorage();
  }, [key]);

  // Save to localStorage with encryption
  useEffect(() => {
    if (!isHydrated) {
      return; // Don't save during initial hydration
    }

    const saveToStorage = async () => {
      // Check if the value is the initial empty value - don't save it
      // This prevents creating empty/default entries in localStorage
      if (
        // Skip saving if value is empty string
        (typeof storedValue === 'string' && storedValue === '') ||
        // Skip saving if value is exactly equal to the initialValue
        JSON.stringify(storedValue) === JSON.stringify(initialValue)
      ) {
        return;
      }

      try {
        const valueToStore = storedValue instanceof Function ? storedValue(initialValue) : storedValue;

        // Encrypt the data
        const encryptedData = await EncryptionService.encryptRequest(valueToStore);

        // Store encrypted data
        localStorage.setItem(key, JSON.stringify(encryptedData));
      } catch (error) {
        console.error(`Error encrypting/saving ${key}:`, error);

        // Fallback: save without encryption
        try {
          const valueToStore = storedValue instanceof Function ? storedValue(initialValue) : storedValue;
          localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (fallbackError) {
          console.error(`Fallback save failed for ${key}:`, fallbackError);
        }
      }
    };

    saveToStorage();
  }, [key, storedValue, isHydrated, initialValue]);

  const setValue = (value: SetValue<T>) => {
    setStoredValue(value);
  };

  return [storedValue, setValue, isHydrated];

}

export default useLocalStorage;