import { ImageSavedResponse } from "@/models/savedResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface ImageSavedListRequest {
    isForYou: number,
    languageId: number,
    isLogin: number
}

async function getUserSavedImage(userData: ImageSavedListRequest): Promise<ImageSavedResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()

        const response = await fetchWithDecryption('/api/usersavedimagelist', {
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

        const data: ImageSavedResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Video Saved List failed:', error);
        throw error;
    }
}

export { getUserSavedImage }
export type { ImageSavedListRequest }