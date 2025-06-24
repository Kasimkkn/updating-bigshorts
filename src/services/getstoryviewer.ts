import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

export interface StoryViewer {
  userId: number;
  userName: string;
  userFullName: string;
  userProfileImage: string;
  isVerified: number;
  isAllowNotification: number;
  isAllowTagging: number;
  isPrivateAccount: number;
  isFollow: number;
  isSnipRestricted: number;
  isBlocked: number;
}

export interface StoryViewerResponse extends CommonResponse<StoryViewer[]> { }

async function getStoryViewerList(storyId: number): Promise<StoryViewerResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(storyId);
    let token = await getAuthToken()
    const response = await fetchWithDecryption(`/api/getstoryviewerlist`, {
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
    
    const data: StoryViewerResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching story viewer list:', error);
    throw error;
  }
}

export { getStoryViewerList }