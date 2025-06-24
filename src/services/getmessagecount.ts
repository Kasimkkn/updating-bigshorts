import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface MessageCount {
    count: string
}

export interface MessageCountResponse extends CommonResponse<MessageCount[]> { }

async function getMessageCount(): Promise<MessageCountResponse> {
    try {
        let token =  await getAuthToken()
        const response = await fetchWithDecryption('/api/getmessagecount', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MessageCountResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Getting Message Count failed:', error);
        throw error;
    }
}

export { getMessageCount }