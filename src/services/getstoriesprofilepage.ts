import { StoryResponse } from '@/models/storyResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface GetStoryDataRequest {
    userId: number
}

async function getStoryProfile(userData: GetStoryDataRequest): Promise<StoryResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getstoriesprofilepage', {
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

        const data: StoryResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user profile Details failed:', error);
        throw error;
    }
}

export { getStoryProfile }
export type { GetStoryDataRequest }