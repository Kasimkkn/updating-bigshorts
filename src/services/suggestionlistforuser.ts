import { CommonResponse } from "@/models/commonResponse"
import { fetchWithDecryption } from "@/utils/fetchInterceptor"
import { getAuthToken } from "@/utils/getAuthtoken"
import EncryptionService from "./encryptionService"

interface SuggestionListForUserRequest {
    userId: number
}

interface SuggestionListForUserData {
    userId: number,
    userName: string,
    userFullName: string,
    userProfileImage: string,
    totalFollowers: string,
    isVerified: number,
    isRequested: number
}

export interface SuggestionListForUserResponse extends CommonResponse<SuggestionListForUserData> { }

async function getSuggestionOfUser(userData: SuggestionListForUserRequest): Promise<SuggestionListForUserResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/suggestionlistforuser', {
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

        const data: SuggestionListForUserResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Suggesting List failed:', error);
        throw error;
    }
}

export { getSuggestionOfUser }
export type { SuggestionListForUserRequest }
