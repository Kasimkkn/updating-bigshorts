import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface SaveFlixCommmentLikeResponse extends CommonResponse<string> { }
interface SaveFlixCommentLikeRequest {
    postId: number,
    commentId: number,
    replyId: number,
    isLike: number
}

async function saveFlixCommentLike(userData: SaveFlixCommentLikeRequest): Promise<SaveFlixCommmentLikeResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/saveflixcommentlike', {
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

        const data: SaveFlixCommmentLikeResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Sending Comment like:', error);
        throw error;
    }
}

export { saveFlixCommentLike }
export type { SaveFlixCommentLikeRequest, SaveFlixCommmentLikeResponse }