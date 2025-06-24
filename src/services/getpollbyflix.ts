import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";
interface PollByFlixRequest {
    postId: number;
    videoId: number;
    userId: number;
}

interface PollByFlixResponse extends CommonResponse<string> { }

async function getPollByFlix(userData: PollByFlixRequest): Promise<PollByFlixResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getpollbyflix', {
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

        const data: PollByFlixResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching poll by post failed:', error);
        throw error;
    }
}

export { getPollByFlix }
export type { PollByFlixRequest, PollByFlixResponse }
