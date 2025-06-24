import { ViewReactionsResponse } from "@/models/viewReactionsResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

async function fetchInsights(reqData: {postId: number, videoId: number}): Promise<ViewReactionsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(reqData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption(`/api/fetchinsights`, {
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

        const data: ViewReactionsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching post list:', error);
        throw error;
    }
}

export { fetchInsights };

