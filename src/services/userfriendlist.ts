import { ProfileFollowerListResponse } from "@/models/profileResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface FollowerListUserRequest {
    friendName: string | "",
    userId: number,
    isCreatePost: number | 0
    page: number,
    pageSize: number
    username: string | null
}

async function getFollowerList(fanData: FollowerListUserRequest): Promise<ProfileFollowerListResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(fanData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/userfriendlist', {
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
        const data: ProfileFollowerListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching fan list failed:', error);
        throw error;
    }
}

export { getFollowerList };
export type { FollowerListUserRequest };
