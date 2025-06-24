import { ProfileResponse } from '@/models/profileResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface ProfileRequest {
    userId: number
}

async function getUserProfile(userData: ProfileRequest): Promise<ProfileResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/userprofile', {
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

        const data: ProfileResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user profile failed:', error);
        throw error;
    }
}

export { getUserProfile }
export type { ProfileRequest }