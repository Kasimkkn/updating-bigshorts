import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface GetVideoCountDetails {
    videoId: number,
    likeCount: number,
    dislikeCount: number,
    superLikeCount: number,
    isLiked: number,
    isDislike: number,
    isSuperLiked: number,
    viewCounts: number
}

export interface GetVideoCountResponse extends CommonResponse<GetVideoCountDetails> { }

interface GetVideoCountRequest {
    videoId: number
}

async function getGetVideoCount({ videoId }: GetVideoCountRequest): Promise<GetVideoCountResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(videoId);
        let token = await getAuthToken()
        const response = await fetchWithDecryption(`/api/getvideocountdetailsV2?videoId=${videoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GetVideoCountResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Video Count failed:', error);
        throw error;
    }
}

export { getGetVideoCount }
export type { GetVideoCountRequest }