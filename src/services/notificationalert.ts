import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface notificationalertData {
    hasUnread: boolean
}

export interface notificationalertResponse extends CommonResponse<notificationalertData[]> { }

async function getNotificationAlert(): Promise<notificationalertResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest({});
        let token = await getAuthToken()
        const response = await fetch('/api/notificationalert', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: notificationalertResponse = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

export { getNotificationAlert }