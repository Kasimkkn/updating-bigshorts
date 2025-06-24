import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from "./encryptionService";

interface HighlightsList {
    highlightId: number;
    highlightName: string;
    coverfile: string;
    listofids: number[];
}

interface GetHighlightsRequest {
    userId: number
}

interface GetHighlightsResponse extends CommonResponse<HighlightsList[]> { }

async function getUserHighlights(userData: GetHighlightsRequest): Promise<GetHighlightsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getuserhighlights', {
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

        const data: GetHighlightsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user highlights failed:', error);
        throw error;
    }
}

export { getUserHighlights }
export type { GetHighlightsRequest, GetHighlightsResponse, HighlightsList }