import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface UnfollowRequest {
    userId: number;
}

interface UnfollowResponse {
    isSuccess: boolean,
    message: string,
    data: string
}

async function removeFollower(userData: UnfollowRequest): Promise<UnfollowResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetch('/api/removefriendentry', {
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

        const data: UnfollowResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Add Friend failed:', error);
        throw error;
    }
}

export { removeFollower }
export type { UnfollowRequest, UnfollowResponse }