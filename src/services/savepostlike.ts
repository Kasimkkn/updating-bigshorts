import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface SavePostLikeResponse extends CommonResponse<string> { }
interface SavePostLikeRequest {
    postId: number,
    isLike: number,
}

async function savePostLike(userData: SavePostLikeRequest): Promise<SavePostLikeResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/savepostlike', {
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

        const data: SavePostLikeResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Sending Like:', error);
        throw error;
    }
}

export { savePostLike }
export type { SavePostLikeRequest, SavePostLikeResponse }