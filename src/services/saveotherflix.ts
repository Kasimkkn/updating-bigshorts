import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface SaveOtherFlixRequest {
    postId: number,
    isSave: number
}

interface SaveOtherFlixResponse extends CommonResponse<""> { }

async function saveOtherFlix(userData: SaveOtherFlixRequest): Promise<SaveOtherFlixResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/saveotherflix', {
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

        const data: SaveOtherFlixResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Add Friend failed:', error);
        throw error;
    }
}

export { saveOtherFlix }
export type { SaveOtherFlixRequest, SaveOtherFlixResponse }