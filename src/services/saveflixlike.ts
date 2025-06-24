import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface SaveFlixLikeResponse extends CommonResponse<string> { }
interface SaveFlixLikeRequest {
    postId: number,
    isLike: number,
}

async function saveFlixLike(userData: SaveFlixLikeRequest): Promise<SaveFlixLikeResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/saveFlixLike', {
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

        const data: SaveFlixLikeResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Sending Like:', error);
        throw error;
    }
}

export { saveFlixLike }
export type { SaveFlixLikeRequest, SaveFlixLikeResponse }