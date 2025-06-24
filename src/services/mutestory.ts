import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface MuteStoryRequest {
    user_id: number
}

interface MuteStoryResponse extends CommonResponse<string> { }

async function muteStory(userData: MuteStoryRequest): Promise<MuteStoryResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/mutestory', {
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

        const data: MuteStoryResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Muting Story failed:', error);
        throw error;
    }
}

export { muteStory }
export type { MuteStoryRequest, MuteStoryResponse }