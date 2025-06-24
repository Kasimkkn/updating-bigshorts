import { PostlistResponse } from "@/models/postlistResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";

interface GetPostListRequest {
    isForYou: string;
    isForInteractiveImage?: string;
    isForInteractiveVideo?: string;
    isForVideo?: string;
    isForAll?: string;
    limit?: number;
    page?: number;
    offset?: number;
    isFromFeedTab?: boolean;
    isLogin: number;
    isShuffle?: number
}

export default async function getFlixList(postData: GetPostListRequest): Promise<PostlistResponse> {
    try {

        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/auth/flixlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,

            },
            body: JSON.stringify(postData),
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

export { getFlixList };
export type { GetPostListRequest };
