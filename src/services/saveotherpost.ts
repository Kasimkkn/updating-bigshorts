import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface SaveOtherPostRequest {
    postId: string,
    isSave: number
}

interface SaveOtherPostResponse extends CommonResponse<""> { }

async function saveOtherPost(userData: SaveOtherPostRequest): Promise<SaveOtherPostResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/saveotherpost', {
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

        const data: SaveOtherPostResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching save other post:', error);
        throw error;
    }
}

export { saveOtherPost }
export type { SaveOtherPostRequest, SaveOtherPostResponse }