import { getAuthToken } from "@/utils/getAuthtoken";
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { CommonResponse } from "@/models/commonResponse";
import EncryptionService from "./encryptionService";

interface MutualFriend {
    userId: number;
    userFullName: string;
    userName: string;
    userProfileImage: string;
    isVerified: number;
    isPrivateAccount: number;
    isAllowNotification: number;
    isAllowTagging: number;
    postFriendId: number;
    isFollow: number;
    isFriend: number;
    isRequested: number;
    isBlock: number;
    isFor: string;
}
  
interface MutualData {
    mutualFriends: MutualFriend[];
    othersCount: number;
}

interface GetMutualFriendsRequest {
    userId: number,
    firstThree: number,
    page: number,
}

interface GetMutualFriendsResponse extends CommonResponse<MutualData> { }

async function getMutualFriends(userData: GetMutualFriendsRequest): Promise<GetMutualFriendsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getcommonfriends', {
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

        const data: GetMutualFriendsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching mutuals:', error);
        throw error;
    }
}

export { getMutualFriends };
export type { GetMutualFriendsRequest, GetMutualFriendsResponse, MutualFriend};