import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface SaveUserBlockRequest {
    blockuserId: number,
    isBlock: number
}

interface SaveUserBlockResponse extends CommonResponse<string> { }

async function saveUserBlock(userData: SaveUserBlockRequest): Promise<SaveUserBlockResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/saveuserblock', {
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

        const data: SaveUserBlockResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Muting Post failed:', error);
        throw error;
    }
}

export { saveUserBlock }
export type { SaveUserBlockRequest, SaveUserBlockResponse }