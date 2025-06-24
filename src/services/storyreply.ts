import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface StoryReplyResponse extends CommonResponse<string> { }
interface StoryReplyRequest {
    storyId: number,
    message: string,
    storyDetails: string
}

async function storyReply(userData: StoryReplyRequest): Promise<StoryReplyResponse> {
    try {
        // const encryptedData = await EncryptionService.encryptRequest({userData});
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/storyreply', {
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

        const data: StoryReplyResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Add Friend failed:', error);
        throw error;
    }
}

export { storyReply }
export type { StoryReplyRequest, StoryReplyResponse }