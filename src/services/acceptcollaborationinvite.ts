import { getAuthToken } from "@/utils/getAuthtoken";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import EncryptionService from "./encryptionService";
  
interface AcceptCollaborationInviteRequest {
    post_id:number;
    is_accepted: boolean;
}

interface AcceptCollaborationInviteResponse {
    isSuccess: boolean;
    message: string;
}

async function acceptcollaborationinvite (postData: AcceptCollaborationInviteRequest): Promise<AcceptCollaborationInviteResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(postData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/acceptcollaborationinvite', {
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

        const data: AcceptCollaborationInviteResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error accepting collaboration invite:', error);
        throw error;
    }
}

export { acceptcollaborationinvite };
export type { AcceptCollaborationInviteRequest, AcceptCollaborationInviteResponse };