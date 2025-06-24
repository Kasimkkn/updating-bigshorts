import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface SaveFlixCommmentResponse extends CommonResponse<string> { }
interface SaveFlixCommentRequest {
    postId: number,
    commentId: number,
    comment: string
}
async function saveFlixComment(userData: SaveFlixCommentRequest): Promise<SaveFlixCommmentResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/saveflixcomment', {
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

        const data: SaveFlixCommmentResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Sending Comment:', error);
        throw error;
    }
}

export { saveFlixComment }
export type { SaveFlixCommentRequest, SaveFlixCommmentResponse }