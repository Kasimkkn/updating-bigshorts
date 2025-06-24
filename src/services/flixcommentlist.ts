import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

export interface FlixCommentListResponse {
    userId: number,
    userFullName: string,
    userName: string,
    userProfileImage: "",
    is_pin: number,
    isFollow: number,
    isVerified: number,
    postId: number,
    commentId: number,
    comment: string,
    isCommentLiked: number,
    commentLikeCount: number,
    commentDays: string,
    replyData: []
}


interface PostCommnetListResponse extends CommonResponse<FlixCommentListResponse[]> { }
interface FlixCommentRequest {
    postId: number,
}

async function flixCommentList(userData: FlixCommentRequest): Promise<PostCommnetListResponse> {
    try {
        // const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/flixcommentlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PostCommnetListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching post comment list:', error);
        throw error;
    }
}

export { flixCommentList }
export type { FlixCommentRequest, PostCommnetListResponse }