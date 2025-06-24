
import { PostlistResponse } from "@/models/postlistResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import EncryptionService from "../encryptionService";
import { getAuthToken } from "@/utils/getAuthtoken";

interface GetPostListRequest {
    isForYou: string;
    isForInteractiveImage?: string;
    isForInteractiveVideo?: string;
    isForVideo?: string;
    isForAll?: string;
    limit?: number;
    page?: number;
    isFromFeedTab?: boolean;
    isLogin: number;
    isForRandom?: boolean;
}


async function getPostListNew(postData: GetPostListRequest): Promise<PostlistResponse> {
    try {
        let token = await getAuthToken()
        const encryptedData = await EncryptionService.encryptRequest(postData);
        const response = await fetchWithDecryption('/api/auth/getpostlist', {
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

        const data: PostlistResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching post list:', error);
        throw error;
    }
}

export { getPostListNew };
export type { GetPostListRequest };

