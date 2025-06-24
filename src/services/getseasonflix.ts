import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import { PostlistItem } from '@/models/postlistResponse';
import EncryptionService from "./encryptionService";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface GetSeasonFlixResponse extends CommonResponse<PostlistItem[]> {}

interface GetSeasonFlixRequest {
    seasonId: number;
}

async function getSeasonFlix(userData: GetSeasonFlixRequest): Promise<GetSeasonFlixResponse> {
    try { 
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getseasonflix', {
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

        const data: GetSeasonFlixResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching save other post:', error);
        throw error;
    }
}

export { getSeasonFlix }
export type { GetSeasonFlixRequest, GetSeasonFlixResponse}