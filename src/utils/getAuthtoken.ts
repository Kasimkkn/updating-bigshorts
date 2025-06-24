import EncryptionService from "@/services/encryptionService";

export const getAuthToken = async (): Promise<string | undefined> => {
    if (typeof window === 'undefined') return undefined;

    try {
        // Parse cookies to find encrypted token
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'token') {
                try {
                    const parsed = JSON.parse(decodeURIComponent(value));

                    if (parsed &&
                        typeof parsed === 'object' &&
                        parsed.isEncrypted &&
                        parsed.iv &&
                        parsed.data) {

                        // Decrypt the data
                        const decryptedData = await EncryptionService.decryptResponse(parsed);

                        // Handle the {valueToStore: "actual_value"} format
                        let finalValue = decryptedData;
                        if (decryptedData &&
                            typeof decryptedData === 'object' &&
                            'valueToStore' in decryptedData) {
                            finalValue = (decryptedData as any).valueToStore;
                        }

                        return finalValue;
                    }
                } catch (parseError) {
                    console.error("Error parsing encrypted token from cookie:", parseError);
                }
            }
        }
return undefined;

    } catch (error) {
        console.error("Error retrieving token from cookies:", error);
        return undefined;
    }
};