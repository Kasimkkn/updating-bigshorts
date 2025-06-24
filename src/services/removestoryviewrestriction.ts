import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface RemoveStoryViewRequest {
    viewer_id: number;
}

interface RemoveStoryResponse extends CommonResponse<string> { }

async function removeStoryView(userData: RemoveStoryViewRequest): Promise<RemoveStoryResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/removestoryviewrestriction', {
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

        const data: RemoveStoryResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Remove Story failed:', error);
        throw error;
    }
}

export { removeStoryView }
export type { RemoveStoryViewRequest, RemoveStoryResponse }
