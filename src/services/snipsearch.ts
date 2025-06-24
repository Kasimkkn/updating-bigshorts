import { CommonResponse } from "@/models/commonResponse";
import { PostlistResponse } from "@/models/postlistResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import { off } from "process";
import EncryptionService from "./encryptionService";

interface SearchResultItem {
    postId: number;
    postTitle: string;
    languageId?: number;
    coverFile: string;
    collaboratorCount?: number;
    firstCollaboratorName?: string;
    userProfileImage: string;
    isAllowComment?: number;
    isPosted?: number;
    scheduleTime?: string;
    userId: number;
    userFullName: string;
    userName: string;
    userMobileNo?: string;
    userEmail?: string;
    isVerified?: number;
    tagUserCount?: number;
    likeCount?: number;
    superLikeCount?: number;
    isSuperLiked?: number;
    dislikeCount?: number;
    isDislike?: number;
    saveCount?: number;
    isLiked?: number;
    isSaved?: number;
    commentCount?: number;
    isCommented?: number;
    shareCount?: number;
    whatsappShareCount?: number;
    isFriend?: number;
    isInteractive?: string;
    interactiveVideo?: string; // Ensure InteractiveVideo interface is defined
    isForInteractiveImage?: number;
    isForInteractiveVideo?: number;
    audioId?: number;
    audioName?: string;
    audioDuration?: string;
    audioOwnerName?: string;
    audioCoverImage?: string;
    audioFile?: string;
    viewCounts?: number;
    videoFile?: string[];
    videoFile_base?: string[];
    postLikeData?: any[]; // Replace with appropriate type if known
    latestCommentDetails?: any[]; // Replace with appropriate type if known
    postLocation?: Location[];
}

interface SnipSearchRequest {
    query: string;
    offset?: number;
    limit?: number;
    searchUsers?: boolean;
}

interface SnipSearchResponse extends CommonResponse<PostlistResponse[]> { }

async function snipSearch(userData: SnipSearchRequest): Promise<PostlistResponse> {
    if (!userData || !userData.query) {
        console.error('Invalid search request:', userData);
        throw new Error('Search query is required');
    }

    try {
        
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const requestBody = {
            ...userData,
            offset: userData.offset || 0,
            limit: userData.limit || 12,
        };
        const encryptedData = await EncryptionService.encryptRequest(requestBody);
        const response = await fetchWithDecryption('/api/snipsearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(encryptedData),
        });
if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
            });
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data) {
            throw new Error('Empty response from server');
        }

        const typedResponse: PostlistResponse = {
            isSuccess: data.isSuccess ?? false,
            message: data.message ?? '',
            data: Array.isArray(data.data) ? data.data.map((item: any) => ({
                postId: item.postId || 0,
                postTitle: item.postTitle || '',
                languageId: item.languageId || 0,
                coverFile: item.coverFile || '',
                collaboratorCount: item.collaboratorCount || 0,
                firstCollaboratorName: item.firstCollaboratorName || '',
                userProfileImage: item.userProfileImage || '',
                isAllowComment: item.isAllowComment || 0,
                isPosted: item.isPosted || 0,
                scheduleTime: item.scheduleTime || '',
                userId: item.userId || 0,
                userFullName: item.userFullName || '',
                userName: item.userName || '',
                userMobileNo: item.userMobileNo || '',
                userEmail: item.userEmail || '',
                isVerified: item.isVerified || 0,
                tagUserCount: item.tagUserCount || 0,
                likeCount: item.likeCount || 0,
                superLikeCount: item.superLikeCount || 0,
                isSuperLiked: item.isSuperLiked || 0,
                dislikeCount: item.dislikeCount || 0,
                isDislike: item.isDislike || 0,
                saveCount: item.saveCount || 0,
                isLiked: item.isLiked || 0,
                isSaved: item.isSaved || 0,
                commentCount: item.commentCount || 0,
                isCommented: item.isCommented || 0,
                shareCount: item.shareCount || 0,
                whatsappShareCount: item.whatsappShareCount || 0,
                isFriend: item.isFriend || 0,
                isInteractive: item.isInteractive || '',
                interactiveVideo: item.interactiveVideo || '',
                isForInteractiveImage: item.isForInteractiveImage || 0,
                isForInteractiveVideo: item.isForInteractiveVideo || 0,
                audioId: item.audioId || 0,
                audioName: item.audioName || '',
                audioDuration: item.audioDuration || '',
                audioOwnerName: item.audioOwnerName || '',
                audioCoverImage: item.audioCoverImage || '',
                audioFile: item.audioFile || '',
                viewCounts: item.viewCounts || 0,
                videoFile: item.videoFile || [],
                videoFile_base: item.videoFile_base || [],
                postLikeData: item.postLikeData || [], // Replace with appropriate type if available
                latestCommentDetails: item.latestCommentDetails || [], // Replace with appropriate type if available
                postTagUser: item.postTagUser || [], // Replace with appropriate type if available
                postLocation: item.postLocation || [], // Replace with appropriate type if available
            })) : [],
        };
return typedResponse;

    } catch (error) {
        console.error('Search failed:', {
            error,
            request: userData,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        });

        return {
            isSuccess: false,
            message: error instanceof Error ? error.message : 'Search failed',
            data: [],
        };
    }
}

export { snipSearch };
export type { SnipSearchRequest, SnipSearchResponse, SearchResultItem };