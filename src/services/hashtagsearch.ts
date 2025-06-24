import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from "./encryptionService";

export interface HashtagList {
    highlightId: number;
    highlightName: string;
    coverfile: string;
    listofids: number[];
}

interface HashtagSearchRequest {
    text: string
}

interface HashtagSearchResponse extends CommonResponse<HashtagList[]> { }

async function hashtagSearch(userData: HashtagSearchRequest): Promise<HashtagSearchResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/hashtagsearch', {
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

        const data: HashtagSearchResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching searched hashtags failed:', error);
        throw error;
    }
}

export { hashtagSearch }
export type { HashtagSearchRequest, HashtagSearchResponse }