import { ViewReactionsPostResponse } from "@/models/viewReactionsPostResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

async function fetchInsightsPosts(postId: number): Promise<ViewReactionsPostResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest({postId: postId});
        let token = await getAuthToken()
        const response = await fetchWithDecryption(`/api/fetchinsightsposts`, {
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

        const data: ViewReactionsPostResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching post list:', error);
        throw error;
    }
}

export { fetchInsightsPosts };

