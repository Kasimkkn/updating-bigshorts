import { MessageUserListData } from '@/types/messageTypes';
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface SelectedUserInChatRequest {
    chatUserId: number;
}

interface SelectedUserResponse {
    data: MessageUserListData[];  // Changed to array
    isSuccess: boolean;
    message: string;
}

async function getSelectedUserInChatList(chatUserId: number): Promise<MessageUserListData> {
    try {
        const encryptedData = await EncryptionService.encryptRequest({chatUserId});
        let token = await getAuthToken();
        const response = await fetchWithDecryption('/api/getSelectedUserChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({chatUserId}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData: SelectedUserResponse = await response.json();
        
        if (!responseData.isSuccess || !responseData.data.length) {
            throw new Error(responseData.message || 'No user data found');
        }

        return responseData.data[0];  // Return the first item from the array
    } catch (error) {
        console.error('Error fetching selected user in chat list:', error);
        throw error;
    }
}

export { getSelectedUserInChatList }
export type { SelectedUserInChatRequest, MessageUserListData }