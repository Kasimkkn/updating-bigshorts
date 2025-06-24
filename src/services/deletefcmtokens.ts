import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface DeleteFcmTokenRequest {
    device_id: string;
}

interface DeleteFcmTokenResponse extends CommonResponse<string> { }

async function deleteFcmToken(userData: DeleteFcmTokenRequest): Promise<DeleteFcmTokenResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/deletefcmtokensV1', {
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

        const data: DeleteFcmTokenResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Editing Profile failed:', error);
        throw error;
    }
}

export { deleteFcmToken }
export type { DeleteFcmTokenRequest, DeleteFcmTokenResponse }