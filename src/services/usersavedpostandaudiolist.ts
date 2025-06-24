import { SavedResponse } from "@/models/savedResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

async function getSavedLists(): Promise<SavedResponse> {
    try {
        
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/usersavedpostandaudiolist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SavedResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Saved List failed:', error);
        throw error;
    }
}

export { getSavedLists }