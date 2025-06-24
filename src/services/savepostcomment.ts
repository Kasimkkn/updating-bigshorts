import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface SavePostCommmentResponse extends CommonResponse<string> { }
interface SavePostCommentRequest {
    postId: number,
    commentId: number,
    comment: string
}

async function savePostComment(userData: SavePostCommentRequest): Promise<SavePostCommmentResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/savepostcomment', {
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

        const data: SavePostCommmentResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Sending Comment:', error);
        throw error;
    }
}

export { savePostComment }
export type { SavePostCommentRequest, SavePostCommmentResponse }