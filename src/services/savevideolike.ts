import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface SaveVideoLikeResponse extends CommonResponse<string> { }
interface SaveVideoLikeRequest {
    postId: number,
    videoId: number,
    isLike: number,
}

async function saveVideoLike(postData: SaveVideoLikeRequest): Promise<SaveVideoLikeResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(postData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/savevideolike', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SaveVideoLikeResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Sending Video Like:', error);
        throw error;
    }
}

export { saveVideoLike }
export type { SaveVideoLikeRequest, SaveVideoLikeResponse }