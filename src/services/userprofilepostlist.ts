import { PostProfileResponse } from '@/models/profileResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface ProfileRequest {
    ownerId?: number,
    isPosted?: number,
    isTrending?: number,
    isTaged?: number,
    isLiked?: number,
    isSaved?: number,
    isSavedVideo?: number,
    isOnlyVideo?: number,
    isSuperLike?: number
}
async function getUserProfilePostLists(userData: ProfileRequest): Promise<PostProfileResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/userprofilepostlist', {
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

        const data: PostProfileResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user profile Details failed:', error);
        throw error;
    }
}

export { getUserProfilePostLists }
export type { ProfileRequest }