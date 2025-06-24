import { CommonResponse } from "@/models/commonResponse";
import { FlixSaved } from "@/types/savedTypes";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface FlixSavedRequest {
    isForYou: number, isLogin: number, languageId: number
}

interface FlixSavedResponse extends CommonResponse<FlixSaved> { }

async function getUserSavedFlix(userData: FlixSavedRequest): Promise<FlixSavedResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token =  await getAuthToken()
        const response = await fetchWithDecryption('/api/usersavedflixlist', {
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

        const data: FlixSavedResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Flix Saved List failed:', error);
        throw error;
    }
}

export { getUserSavedFlix }
export type { FlixSavedRequest }