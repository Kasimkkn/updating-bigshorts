import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface FlixCommentLikeListRequest {
    postId: number,
}

interface FlixCommentLikeListResponse extends CommonResponse<""> { }

async function flixCommentLikeList(userData: FlixCommentLikeListRequest): Promise<FlixCommentLikeListResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/flixcommentlikelist', {
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

        const data: FlixCommentLikeListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Add Friend failed:', error);
        throw error;
    }
}

export { flixCommentLikeList }
export type { FlixCommentLikeListRequest, FlixCommentLikeListResponse }