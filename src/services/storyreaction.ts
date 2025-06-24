import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface StoryReactionResponse extends CommonResponse<string> { }
interface StoryReactionRequest {
    storyId: number,
    reaction: string,
    storyDetails: string
}

async function storyReaction(userData: StoryReactionRequest): Promise<StoryReactionResponse> {
    try {
        // const encryptedData = await EncryptionService.encryptRequest({userData});
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/storyreaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StoryReactionResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Add Friend failed:', error);
        throw error;
    }
}

export { storyReaction }
export type { StoryReactionRequest, StoryReactionResponse }