// snipplayerinssupmodel.ts
import { PostlistItem } from './postlistResponse'; // Adjust import based on your actual model location

export interface SnipPlayerInSsupModel {
    snipItem?: PostlistItem | null;
    positionX?: number | null;
    positionY?: number | null;
    scale?: number | null;
}

export function snipPlayerInSsupModelFromJson(json: any): SnipPlayerInSsupModel {
    return {
        snipItem: json.snipItem ? postListDataModelFromJson(json.snipItem) : null,
        positionX: json.positionX ?? null,
        positionY: json.positionY ?? null,
        scale: json.scale ?? null
    };
}

// Note: You'll need to implement postListDataModelFromJson 
// based on the actual structure of PostListDataModel
function postListDataModelFromJson(json: any): PostlistItem {
    return {
        description: json.description ?? '',
        postId: json.postId ?? 0,
        postTitle: json.postTitle ?? '',
        languageId: json.languageId ?? 0,
        coverFile: json.coverFile ?? '',
        userProfileImage: json.userProfileImage ?? '',
        isAllowComment: json.isAllowComment ?? 0,
        isPosted: json.isPosted ?? 0,
        scheduleTime: json.scheduleTime ?? '',
        userId: json.userId ?? 0,
        userFullName: json.userFullName ?? '',
        userName: json.userName ?? '',
        userMobileNo: json.userMobileNo ?? '',
        userEmail: json.userEmail ?? '',
        isVerified: json.isVerified ?? 0,
        tagUserCount: json.tagUserCount ?? 0,
        likeCount: json.likeCount ?? 0,
        superLikeCount: json.superLikeCount ?? 0,
        isSuperLiked: json.isSuperLiked ?? 0,
        dislikeCount: json.dislikeCount ?? 0,
        isDislike: json.isDislike ?? 0,
        saveCount: json.saveCount ?? 0,
        isLiked: json.isLiked ?? 0,
        isSaved: json.isSaved ?? 0,
        commentCount: json.commentCount ?? 0,
        isCommented: json.isCommented ?? 0,
        shareCount: json.shareCount ?? 0,
        whatsappShareCount: json.whatsappShareCount ?? 0,
        isFriend: json.isFriend ?? 0,
        isInteractive: json.isInteractive ?? '',
        interactiveVideo: json.interactiveVideo ?? '',
        isForInteractiveImage: json.isForInteractiveImage ?? 0,
        isForInteractiveVideo: json.isForInteractiveVideo ?? 0,
        audioId: json.audioId ?? 0,
        audioName: json.audioName ?? '',
        audioDuration: json.audioDuration ?? '',
        audioOwnerName: json.audioOwnerName ?? '',
        audioCoverImage: json.audioCoverImage ?? '',
        audioFile: json.audioFile ?? '',
        viewCounts: json.viewCounts ?? 0,
        videoFile: Array.isArray(json.videoFile) ? json.videoFile : [],
        videoFile_base: Array.isArray(json.videoFile_base) ? json.videoFile_base : [],
        postLikeData: Array.isArray(json.postLikeData) ? json.postLikeData : [],
        latestCommentDetails: Array.isArray(json.latestCommentDetails) ? json.latestCommentDetails : [],
        postTagUser: Array.isArray(json.postTagUser) ? json.postTagUser : [],
        collaboratorCount: 0,
        firstCollaboratorName: '',
    };
}