//import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface LikeDetailsRequest {
    postId: number,
}

interface LikeDetailsResponse {
    isSuccess: boolean;
    message: LikeMessage | null;
    data: string;
}

interface LikeMessage {
    postId: number;
    videoId: number | null;
    sumOfLikes: string;
    sumOfSuperLikes: string;
    totalSumOfLikes: number;
    firstThreeUsers: LikeUser[];
    allVideoLikes: VideoLike[];
    postLikeDetails: PostLikeDetails;
    totalViews: number;
}

interface LikeUser {
    id: number;
    name: string;
    username: string;
    profileimage: string;
    likeType: "like" | "superlike"; // Adjust if needed
    isRequested: number;
    isFriend: number;
}

interface VideoLike {
    videoId: number;
    sumOfLikes: string;
    sumOfSuperLikes: string;
    totalSumOfLikes: number;
}

interface PostLikeDetails {
    sumOfLikes: string;
    sumOfSuperLikes: string;
    totalSumOfLikes: number;
}

async function getLikeDetails(userData: LikeDetailsRequest): Promise<LikeDetailsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getlikedetails', {
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

        const data: LikeDetailsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching save other post:', error);
        throw error;
    }
}

export { getLikeDetails }
export type { LikeDetailsRequest, LikeDetailsResponse , LikeMessage}