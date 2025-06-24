import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";
interface PollByPostRequest {
    postId: number;
    videoId: number;
    userId: number;
}

interface PollByPostResponse extends CommonResponse<string> { }

async function getPollByPosts(userData: PollByPostRequest): Promise<PollByPostResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getpollbypost', {
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

        const data: PollByPostResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching poll by post failed:', error);
        throw error;
    }
}

export { getPollByPosts }
export type { PollByPostRequest, PollByPostResponse }
