import { CommonResponse } from "./commonResponse";
import { VideoFile } from "./profileResponse";

interface PostTagUserData {
    postFriendId: number;
    userId: number;
    userFullName: string;
    userName: string;
    userProfileImage: string;
    isVerified: number;
    isPrivateAccount: number;
    isAllowNotification: number;
    isAllowTagging: number;
    isFollow: number;
    isBlock: number;
    isFor: string;
}

interface AllSavedData {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    userProfileImage: string;
    isAllowComment: number;
    isPosted: number;
    tagUserCount: number;
    scheduleTime: string;
    userId: number;
    userFullName: string;
    userName: string;
    userMobileNo: string;
    userEmail: string;
    isVerified: number;
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
    interactiveVideo: Array<VideoFile>;
    isForInteractiveImage: number;
    isForInteractiveVideo: number;
    audioId: number;
    audioName: string;
    audioDuration: string;
    audioOwnerName: string;
    audioCoverImage: string;
    audioFile: string;
    viewCounts: number;
    savedDate: string;
    videoFile: Array<string>;
    videoFile_base: Array<string>;
    mediaType: number;
    postTagUser: Array<PostTagUserData>;
}

export interface SavedResponse extends CommonResponse<AllSavedData> { }


interface VideoSaved {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    userProfileImage: string;
    isAllowComment: number,
    isPosted: number,
    scheduleTime: string,
    userId: number,
    userFullName: string;
    userName: string;
    userMobileNo: string;
    userEmail: string;
    isVerified: number;
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
    interactiveVideo: Array<VideoFile>;
    isForInteractiveImage: number;
    isForInteractiveVideo: number;
    audioId: number;
    audioName: string;
    audioDuration: string;
    audioOwnerName: string;
    audioCoverImage: string;
    audioFile: string;
    viewCounts: number;
    savedDate: string;
    videoFile: Array<string>;
    videoFile_base: Array<string>;
    postLikeData: any[],
    latestCommentDetails: [
        {
            name: string,
            username: string,
            profileimage: string,
            comment: string,
            userid: number,
            isFollow: number,
            isRequested: number,
        }
    ],
    postTagUser: Array<PostTagUserData>;
}

export interface VideoSavedResponse extends CommonResponse<VideoSaved> { }

interface MusicSaved {
    audioId: number,
    audioName: string,
    audioDuration: string,
    audioCoverImage: string,
    audioFile: string,
}

export interface MusicSavedResponse extends CommonResponse<MusicSaved> { }


export interface ImageSavedResponse extends CommonResponse<VideoSaved> { }