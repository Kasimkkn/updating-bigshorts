import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface UnMuteStoryRequest {
    user_id: number
}

interface UnMuteStoryResponse extends CommonResponse<string> { }


async function unMuteStory(userData: UnMuteStoryRequest): Promise<UnMuteStoryResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/unmutestory', {
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

        const data: UnMuteStoryResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Un Muting Story failed:', error);
        throw error;
    }
}

export { unMuteStory }
export type { UnMuteStoryRequest, UnMuteStoryResponse }