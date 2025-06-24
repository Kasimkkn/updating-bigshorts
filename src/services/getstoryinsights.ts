import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface StoryInsightsData {
    accountReached: number,
    accountEngaged: number,
    profileActivity: number,
    totalReach: number,
    followerReach: number,
    nonFollowerReach: number,
    totalReplies: number,
    totalReaction: number,
    totalShare: number,
    profileVisits: number,
    profileFollows: number
}

export interface StoryInsightsResponse extends CommonResponse<StoryInsightsData> { }

interface StoryInsightsRequest {
    storyId: number
}

async function getStoryInsights({ storyId }: StoryInsightsRequest): Promise<StoryInsightsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(storyId);
        let token = await getAuthToken()
        const response = await fetchWithDecryption(`/api/getstoryinsights`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-story-id': `${storyId}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StoryInsightsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Story Insights failed:', error);
        throw error;
    }
}

export { getStoryInsights }