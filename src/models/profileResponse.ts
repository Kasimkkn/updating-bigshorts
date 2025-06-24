import { CommonResponse } from "./commonResponse";

interface ProfileData {
    userId: number,
    userFullName: string,
    userPronouns: string,
    userEmail: string,
    isContactViaEmail: number,
    isContactViaPhone: number,
    userMobile: string,
    userName: string,
    userRoleId: number,
    userProfileImage: string,
    userBirthdate: string,
    userGender: string,
    userProfileBio: string,
    userWebsiteLink: string,
    isVerified: number,
    userRole: string,
    totalFollowing: number,
    totalHeart: number,
    totalFan: number,
    isPrivateAccount: number,
    isAllowNotification: number,
    isAllowTagging: number,
    aboutUsLink: string,
    helpLink: string,
    faqLink: string,
    totalUserPostCount: number,
    isAllowUserNotification: number,
    isFacebookConnected: number,
    isInstagramConnected: number,
    isTweeterConnected: number,
    isYoutubeConnected: number,
    facebookId: string,
    instagramId: string,
    tweeterId: string,
    youtubeId: string,
    verificationLink: string,
    frequentlyAskedQuestionsLink: string,
    privacyPolicy: string,
    termsAndConditions: string,
    clientEmail: string,
    isBlock: number,
    isStoryMuted: number,
    isRequested: number,
    hasRequested: number,
    isFriend: number,
    socialMediaLinks: [],
    isBigshortsOriginal: number,
}

export interface ProfileResponse extends CommonResponse<ProfileData> { }


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
    functionality_datas: any; // Depending on what kind of data this is, you can be more specific
    post_id: number;
    video_id: number;
}

export interface PostProfileData {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    userProfileImage: string;
    isAllowComment: number;
    isPosted: number;
    tagUserCount: number;
    scheduleTime: string;
    createdAt: string;
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
    interactiveVideo: VideoFile[];
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
    latestCommentDetails: any[];
    postTagUser: any[];
}

export interface PostProfileResponse extends CommonResponse<PostProfileData[]> { }

interface ProfileFollowingList {
    userId: number,
    userName: string,
    userFullName: string,
    userProfileImage: string,
    isVerified: number,
    isAllowNotification: number,
    isAllowTagging: number,
    isPrivate: number,
    isFollow: number,
    isRequested: number
}

export interface ProfileFollowingListResponse extends CommonResponse<ProfileFollowingList> { }

interface ProfileFollowerList {
    userId: number,
    friendId: number,
    friendUserName: string,
    friendName: string,
    userProfileImage: string,
    isVerified: number,
    isAllowNotification: number,
    isAllowTagging: number,
    isPrivate: number,
    isFollow: number,
    isRequested: number
}

export interface ProfileFollowerListResponse extends CommonResponse<ProfileFollowerList> { }