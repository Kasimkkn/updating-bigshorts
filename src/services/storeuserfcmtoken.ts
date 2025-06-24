import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";

interface StoreUserFcmTokenRequest {
    fcm_token: string;
    device_id: string;
    platform: 'android' | 'ios';
}

interface StoreUserFcmTokenResponse extends CommonResponse<string> { }

async function storeUserFcmToken(userData: StoreUserFcmTokenRequest): Promise<StoreUserFcmTokenResponse> {
    try {
        let token = await getAuthToken()
        const response = await fetch('/api/storeuserfcmtoken', {
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

        const data: StoreUserFcmTokenResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Editing Profile failed:', error);
        throw error;
    }
}

export { storeUserFcmToken }
export type { StoreUserFcmTokenRequest, StoreUserFcmTokenResponse }