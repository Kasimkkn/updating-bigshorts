import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface AcceptFriendRequest {
    requestorId: number;
}

interface AcceptFriendResponse {
    isSuccess: boolean,
    message: string,
    data: string
}

async function acceptFriend(userData: AcceptFriendRequest): Promise<AcceptFriendResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/acceptrequest', {
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

        const data: AcceptFriendResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching accept Friend failed:', error);
        throw error;
    }
}

export { acceptFriend }
export type { AcceptFriendRequest, AcceptFriendResponse }
