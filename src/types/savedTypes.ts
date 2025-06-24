export interface VideoFile {
    id: number;
    parent_id: number;
    path: string;
    ios_streaming_url: string;
    android_streaming_url: string;
    duration: string;
    is_selcted: boolean;
    on_video_end: string | null;
    time_of_video_element_show: string | null;
    audio_id: number;
    audio_file_path: string;
    audio_name: string;
    audio_duration: string;
    functionality_datas: any;
    post_id: number;
    video_id: number;
    aspect_ratio:number
}
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
    isRequested: number;
}

interface PostLocation {
    locationId: number;
    locationName: string;
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
    postTagUser?: Array<PostTagUserData>;
}


interface VideoSaved {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    userProfileImage?: string;
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
    postLocation: Array<PostLocation>;
    firstCollaboratorName: string;
    collaboratorCount: number;
}


interface MusicSaved {
    audioId: number,
    audioName: string,
    audioDuration: string,
    audioCoverImage: string,
    audioFile: string,
    coverFile: string,
}

interface FlixSaved {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    userProfileImage: string;
    isAllowComment: number;
    scheduleTime: string;
    userId: number;
    userFullName: string;
    userName: string;
    description: string;
    nsfw: number;
    isVerified: number;
    likeCount: number;
    saveCount: number;
    isLiked: number;
    isSaved: number;
    commentCount: number;
    isComment: number;
    isFriend: number;
    isFollow: number;
    viewCounts: number;
    createdAt: string;
    audioId: number;
    audioName: string;
    audioDuration: string;
    audioOwnerName: string;
    audioCoverImage: string;
    audioFile: string;
    interactiveVideo: Array<VideoFile>;
    videoFile: Array<string>;
    videoFile_base: Array<string>;
    postLikeData: any[];
    latestCommentDetails: Array<{
        name: string;
        username: string;
        profileimage: string;
        comment: string;
        userid: number;
        isFollow: number;
        isRequested: number;
    }>;
    postTagUser: Array<PostTagUserData>;
    postLocation: Array<PostLocation>;
    tagUserCount: number;
}

interface ImageSaved extends VideoSaved { }

export type { VideoSaved, MusicSaved, ImageSaved, AllSavedData, FlixSaved };