import { getAuthToken } from "@/utils/getAuthtoken";
import { CommonResponse } from "@/models/commonResponse";
import EncryptionService from "./encryptionService";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface LikeCountData {
  videoId: number;
  likeCount: number;
  dislikeCount: number;
  superLikeCount: number;
  isLiked: number;
  isDislike: number;
  isSuperLiked: number;
  viewCounts: number;
}

interface LikeCountResponse extends CommonResponse<LikeCountData> { }

async function getLikeCount(videoId: number): Promise<LikeCountResponse> {
  try {
    let token = await getAuthToken()
    const response = await fetchWithDecryption(`${API_BASE_URL}/app/getvideocountdetailsV1?videoId=${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data: LikeCountResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching like count:', error);
    throw error;
  }
}
export { getLikeCount };
export type { LikeCountResponse, LikeCountData };