import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";
interface RestrictStoryViewRequest {
    viewer_id: number;
}

interface RestrictStoryResponse extends CommonResponse<string> { }

async function restrictStoryView(userData: RestrictStoryViewRequest): Promise<RestrictStoryResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/restrictstoryview', {
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

        const data: RestrictStoryResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Restrict Story failed:', error);
        throw error;
    }
}

export { restrictStoryView }
export type { RestrictStoryViewRequest, RestrictStoryResponse }
