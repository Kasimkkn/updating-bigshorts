import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

export interface PostCommentListResponse {
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
    replyData: CommentReply[]
}

export interface CommentReply {
    commentDays: string;              
    commentReplyLikeCount: number;  
    isCommentReplyLiked: number;    
    isFollow: number;               
    isVerified: number;              
    postId: number;                  
    reply: string;                   
    replyId: number;                 
    userFullName: string;           
    userId: number;                 
    userName: string;               
    userProfileImage: string;       
  }


interface PostCommnetListResponse extends CommonResponse<PostCommentListResponse[]> { }
interface PostCommentRequest {
    postId: number,
}

async function postCommentList(userData: PostCommentRequest): Promise<PostCommnetListResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/postCommentList', {
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

        const data: PostCommnetListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching post comment list:', error);
        throw error;
    }
}

export { postCommentList }
export type { PostCommentRequest, PostCommnetListResponse }