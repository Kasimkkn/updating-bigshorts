import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface UpdateSettingRequest {
    isNotificationAllowed: number;
    isAllowTaging: number;
    isContactViaEmail: number;
    isContactViaPhone: number;
}

interface UpdateSettingResponse extends CommonResponse<string> { }

async function updateSetting(userData: UpdateSettingRequest): Promise<UpdateSettingResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/updateuserprofile', {
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

        const data: UpdateSettingResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Editing Profile failed:', error);
        throw error;
    }
}

export { updateSetting }
export type { UpdateSettingRequest, UpdateSettingResponse }