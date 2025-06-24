import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";

interface HashtagListRequest {
    hashtag: string;
}

interface HashtagItem {
    id: string;
    name: string;
    isFor: string;
}

interface HashtagListResponse {
    data: HashtagItem[];
}

export async function getHashtagList(request: HashtagListRequest): Promise<HashtagItem[]> {
    try {
const token = await getAuthToken()
        const response = await fetchWithDecryption(`/api/hashtaglist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                hashTag: request.hashtag,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json: HashtagItem[] = await response.json();
return json;
    } catch (error) {
        console.error('Error fetching post list:', error);
        throw error;
    }
}


export type { HashtagItem, HashtagListRequest, HashtagListResponse };