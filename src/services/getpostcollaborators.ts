import { getAuthToken } from "@/utils/getAuthtoken";
import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import EncryptionService from "./encryptionService";

interface Collaborator {
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
    isFriend: number;
    isRequested: number;
    isBlock: number;
    isFor: string;
}

interface GetPostCollaboratorsRequest {
    postId:number;
}

interface GetPostCollaboratorsResponse extends CommonResponse<Collaborator[]> { }

async function getPostCollaborators(postData: GetPostCollaboratorsRequest): Promise<GetPostCollaboratorsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(postData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getpostcollaborators', {
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

        const data: GetPostCollaboratorsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching collaborators:', error);
        throw error;
    }
}

export { getPostCollaborators };
export type { GetPostCollaboratorsRequest, GetPostCollaboratorsResponse, Collaborator };