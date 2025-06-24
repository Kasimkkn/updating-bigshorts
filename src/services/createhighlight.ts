import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface CreateHighlightResponse {
    isSuccess: boolean;
    message: string;
    data: string;
}

export interface CreateHighlightData {
    highlightName: string;
    postIds: number[],
    highlightId: number | null,
    coverfile: File | string

}

async function createHighlight(userData: CreateHighlightData): Promise<CreateHighlightResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/createhighlight', {
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

        const data: CreateHighlightResponse = await response.json();
        return data;

    } catch (error) {
        console.error('Error during post submission:', error);
        throw error;
    }
}

export { createHighlight };
export type { CreateHighlightResponse };

