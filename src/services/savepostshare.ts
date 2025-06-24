import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface SavePostShareResponse extends CommonResponse<"">{};

interface SavePostShareRequest{
    postId: number;
    platform: string;
    isNormalShare: number;
    isWhatsappShare: number;
}


async function savePostShare(userData: SavePostShareRequest): Promise<SavePostShareResponse> {
    try { 
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/savepostshare', {
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

        const data: SavePostShareResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching save other post:', error);
        throw error;
    }
}

export { savePostShare }
export type { SavePostShareRequest, SavePostShareResponse}