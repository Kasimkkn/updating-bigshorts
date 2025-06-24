import { CommonResponse } from "./commonResponse";

interface HashTags {
    id: number;
    name: string;
    isFor: string;
}

interface AudioData {
    generic: number;
    genericImage: string;
    genericName: string;
    audioId: number;
    audioName: string;
    audioDuration: string;
    audioOwnerName: string;
    audioCoverImage: string;
    audioFile: string;
    isBookmark: number;
    categoryId: number;
    categoryName: string;
    highlightText: string;
    categoryImage: string;
    languageId: number;
    languageName: string;
    isFor: string;
}

interface UserData {
    userId: number;
    userPronouns: string;
    userFullName: string;
    userName: string;
    userProfileImage: string;
    isVerified: number;
    isPrivateAccount: number;
    isAllowNotification: number;
    isAllowTagging: number;
    isFollow: number;
    isBlock: number;
    isRequested: number;
    isFor: string;
}

export interface SearchData {
    data: Array<AudioData | UserData | HashTags>;
}

export interface SeacrhedResponse extends CommonResponse<SearchData> { }

export type { AudioData, UserData, HashTags };
