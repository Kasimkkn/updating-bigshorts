import { PostlistItem, PostlistResponse } from "@/models/postlistResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import { hash } from "crypto";

interface Hashtag {
    hashId: number;
    hashName: string;
    postList: PostlistItem[];
    totalViews: number;
    type: string;
}

interface HashtagApiResponse {
    isSuccess: boolean;
    message: string;
    data: Hashtag[]; // assuming array of Hashtag
}

interface HashtagRequest {
    hashTagId: number;
}

async function discoverhashtag(hashtag: HashtagRequest): Promise<Hashtag> {
    try {

        const token = await getAuthToken()
        const response = await fetchWithDecryption(`/api/discoverhashtag`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                hashTagId: hashtag.hashTagId,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json: HashtagApiResponse = await response.json();
        if (json.isSuccess && json.data.length > 0) {
            return json.data[0];
        } else {
            throw new Error('No hashtag data returned');
        }
    } catch (error) {
        console.error('Error fetching post list:', error);
        throw error;
    }
}

export { discoverhashtag };
export type { Hashtag, HashtagRequest };

