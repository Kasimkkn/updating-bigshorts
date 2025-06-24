import { VideoSavedResponse } from "@/models/savedResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface VideoSavedListRequest {
    isForYou: number,
    languageId: number,
    isLogin: number
}

async function getUserSavedVideo(userData: VideoSavedListRequest): Promise<VideoSavedResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/usersavedvideolist', {
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

        const data: VideoSavedResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Video Saved List failed:', error);
        throw error;
    }
}

export { getUserSavedVideo }
export type { VideoSavedListRequest }