import { CommonResponse } from '@/models/commonResponse';
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface AboutProfileRequest {
    userId: number;
}
interface UserProfile {
    username: string;
    profileimage: string;
    name: string;
    isverified: boolean;
    createdAt: string;
    gender: string;
    pronouns: string | null;
}

interface AboutProfileResponse extends CommonResponse<UserProfile> { }
async function getAboutProfile(userData: AboutProfileRequest): Promise<AboutProfileResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken();
        const response = await fetchWithDecryption('/api/aboutprofile', {
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

        const data: AboutProfileResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching account overview:', error);
        throw error;
    }
}

export { getAboutProfile }
export type { AboutProfileRequest,AboutProfileResponse, UserProfile }