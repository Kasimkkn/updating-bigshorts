import { ProfileFollowingListResponse } from "@/models/profileResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface FanListForUserRequest {
    friendName: string | "",
    userId: string | number,
    isCreatePost: number | 0,
    page: number,
    pageSize: number,
    username: string | null

}

async function getFanList(fanData: FanListForUserRequest): Promise<ProfileFollowingListResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(fanData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/fanlistforuser', {
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

        const data: ProfileFollowingListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching fan list failed:', error);
        throw error;
    }
}

export { getFanList };
export type { FanListForUserRequest };
