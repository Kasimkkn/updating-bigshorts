import { NotificationResponse } from "@/models/notficationResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface PushNotificationReq {
    page: number
}

async function getNotificationList(userData: PushNotificationReq): Promise<NotificationResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getpushnotification', {
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

        const data: NotificationResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Notification failed:', error);
        throw error;
    }
}

export { getNotificationList };
