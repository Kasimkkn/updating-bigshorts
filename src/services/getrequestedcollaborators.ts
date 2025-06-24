import { getAuthToken } from "@/utils/getAuthtoken";
import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import EncryptionService from "./encryptionService";

interface RequestedCollaborator {
    collaborativePostId: number;
    userId: number;
    userFullName: string;
    userName: string;
    userProfileImage: string;
    postFriendId: number;
    isVerified: number;  
    isPrivateAccount: number;
    isAllowNotification: number;
    isAllowTagging: number;
    isFollow: number;
    isBlock: number;
    isFor: string;
  }
  

interface GetRequestedCollaboratorsRequest {
    postId:number;
}

interface GetRequestedCollaboratorsResponse extends CommonResponse<RequestedCollaborator[]> { }

async function getRequestedCollaborators(postData: GetRequestedCollaboratorsRequest): Promise<GetRequestedCollaboratorsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(postData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getrequestedcollaborators', {
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

        const data: GetRequestedCollaboratorsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching collaborators:', error);
        throw error;
    }
}

export { getRequestedCollaborators };
export type { GetRequestedCollaboratorsRequest, GetRequestedCollaboratorsResponse, RequestedCollaborator };