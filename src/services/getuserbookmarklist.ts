import { MusicSavedResponse } from "@/models/savedResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface MusicSavedRequest {
    pageNo: number,
    limit: number
}
async function getUserSavedAudio(userData: MusicSavedRequest): Promise<MusicSavedResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getuserbookmarklist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(encryptedData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MusicSavedResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Audio Saved List failed:', error);
        throw error;
    }
}

export { getUserSavedAudio }
export type { MusicSavedRequest }