import { AllUsersInfo, AllUsersResponse } from "@/models/allUsersResponse";
import { MessageUserListData } from "@/types/messageTypes";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface ChatUserListRequest {
    limit:number
    pageNo: number;
    
}

async function getChatUserList(chatUserData: ChatUserListRequest): Promise<AllUsersResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(chatUserData);
        let token = await getAuthToken();
        const response = await fetchWithDecryption('/api/userchatlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(encryptedData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: AllUsersResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching chat user list:', error);
        throw error;
    }
}

export { getChatUserList };
export type { ChatUserListRequest };
