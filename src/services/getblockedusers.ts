import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

export interface BlockedUser {
    userId: number;
    userPronouns: string | null;
    userFullName: string;
    userName: string;
    userProfileImage: string;
    isVerified: number; // Can be converted to boolean if required
    isPrivateAccount: number; // Can be converted to boolean if required
    isAllowNotification: number; // Can be converted to boolean if required
    isAllowTagging: number; // Can be converted to boolean if required
    isFollow: number; // Can be converted to boolean if required
    isMuted: number; // Can be converted to boolean if required
    isRequested: number; // Can be converted to boolean if required
    isFor: string;
}

interface BlockedUsersReponse extends CommonResponse<BlockedUser[]> { }
async function getBlockedUsers(): Promise<BlockedUsersReponse> {
    try {
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getblockedusers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BlockedUsersReponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user profile failed:', error);
        throw error;
    }
}

export { getBlockedUsers }
export type { BlockedUsersReponse }