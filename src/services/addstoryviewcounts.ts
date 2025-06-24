import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface AddStoryViewCountsRequest {
    storyId: number
}
interface AddStoryViewCountsResponse extends CommonResponse<""> { }
async function addStoryViewCounts(userData: AddStoryViewCountsRequest): Promise<AddStoryViewCountsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/addstoryviewcounts', {
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

        const data: AddStoryViewCountsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Add Friend failed:', error);
        throw error;
    }
}

export { addStoryViewCounts }
export type { AddStoryViewCountsRequest, AddStoryViewCountsResponse }

