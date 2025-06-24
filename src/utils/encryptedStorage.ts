import EncryptionService from "@/services/encryptionService";

/**
 * Get an encrypted item from localStorage (for use in service files)
 */
export const getEncryptedItem = async (key: string): Promise<any> => {
    try {
        const item = localStorage.getItem(key);
        if (!item) {
            return null;
        }
        try {
            const parsed = JSON.parse(item);
            
            if (parsed && 
                typeof parsed === 'object' && 
                parsed.isEncrypted && 
                parsed.iv && 
                parsed.data) {
                
                const decryptedData = await EncryptionService.decryptResponse(parsed);
                
                let finalValue = decryptedData;
                
                if (decryptedData &&
                    typeof decryptedData === 'object' &&
                    'valueToStore' in decryptedData) {
                    finalValue = (decryptedData as any).valueToStore;
                }
                
                return finalValue;
            } else {
                return parsed;
            }
        } catch (parseError) {
            return item;
        }
    } catch (error) {
        console.error(`Error getting/decrypting ${key}:`, error);
        return null;
    }
};

/**
 * Set an encrypted item in localStorage (for use in service files)
 */
export const setEncryptedItem = async (key: string, value: any): Promise<void> => {
    try {
        const encryptedData = await EncryptionService.encryptRequest(value);
        localStorage.setItem(key, JSON.stringify(encryptedData));
    } catch (error) {
        console.error(`Error encrypting/saving ${key}:`, error);
        
        // Fallback: save without encryption
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (fallbackError) {
            console.error(`Fallback save failed for ${key}:`, fallbackError);
        }
    }
};