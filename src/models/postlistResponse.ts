import { CommonResponse } from "./commonResponse";

export interface TaggedUsers {
    isAllowNotification: number,
    isAllowTagging: number;
    isBlock: number;
    isFollow: number;
    isFor: string;
    isPrivateAccount: number;
    isRequested: number;
    isVerified: number;
    postFriendId: number;
    userFullName: string;
    userId: number;
    userName: string;
    userProfileImage: string;
}

interface Location {
    locationId: number;
    locationName: string;
}
export interface PostlistItem {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    collaboratorCount: number;
    firstCollaboratorName: string;
    userProfileImage: string;
    isAllowComment: number;
    isPosted: number;
    scheduleTime: string;
    userId: number;
    userFullName: string;
    userName: string;
    userMobileNo: string;
    userEmail: string;
    isVerified: number;
    tagUserCount: number;
    likeCount: number;
    superLikeCount: number;
    isSuperLiked: number;
    dislikeCount: number;
    isDislike: number;
    saveCount: number;
    isLiked: number;
    isSaved: number;
    commentCount: number;
    isCommented: number;
    shareCount: number;
    whatsappShareCount: number;
    isFriend: number;
    isInteractive: string;
    interactiveVideo: string; // Ensure InteractiveVideo interface is defined
    isForInteractiveImage: number;
    isForInteractiveVideo: number;
    audioId: number;
    audioName: string;
    audioDuration: string;
    audioOwnerName: string;
    audioCoverImage: string;
    audioFile: string;
    viewCounts: number;
    videoFile: string[];
    videoFile_base: string[];
    postLikeData: any[]; // Replace with appropriate type if known
    latestCommentDetails: any[]; // Replace with appropriate type if known
    postTagUser: TaggedUsers[]; // Replace with appropriate type if known
    postLocation?: Location[];
    description: string;
    genreId?: number;
    userCollab?: number;
}

export interface PostlistResponse extends CommonResponse<PostlistItem[]> { }
