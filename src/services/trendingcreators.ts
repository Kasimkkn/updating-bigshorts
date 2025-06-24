import { CommonResponse } from "@/models/commonResponse"
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";


interface SuggestionListForUserData {
    userId: number,
    userName: string,
    userFullName: string,
    userProfileImage: string,
    totalFollowers: string,
    isVerified: number,
    isFollowing: number
}

export interface TrendingCreatorsResponse extends CommonResponse<SuggestionListForUserData> { }


async function getTrendingCreators(): Promise<TrendingCreatorsResponse> {
    try {
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/trendingcreators', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TrendingCreatorsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Suggesting List failed:', error);
        throw error;
    }
}

export { getTrendingCreators }
