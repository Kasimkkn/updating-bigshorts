import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";
import { enc } from "crypto-js";

interface MutePostRequest {
    mutedUserId: number
}

interface MutePostResponse extends CommonResponse<string> { }



async function mutePost(userData: MutePostRequest): Promise<MutePostResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/muteposts', {
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

        const data: MutePostResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Muting Post failed:', error);
        throw error;
    }
}

export { mutePost }
export type { MutePostRequest, MutePostResponse }