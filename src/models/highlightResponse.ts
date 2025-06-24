import { CommonResponse } from "./commonResponse";

interface Stories {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    isAllowComment: number;
    isPosted: number;
    scheduleTime: string;
    isInteractive: string;
    interactiveVideo: string;
    isForInteractiveImage: number;
    isForInteractiveVideo: number;
    audioId: number;
    audioName: string;
    audioDuration: string;
    audioOwnerName: string;
    audioCoverImage: string;
    audioFile: string;
    viewCounts: number;
    isRead: number;
    storyEndTime: string;
    taggedUser: any[];
}

interface HighlightData {
    highlightId: number;
    highlightName: string;
    userId: number;
    userProfileImage: string;
    userFullName: string;
    userName: string;
    userMobileNo: string;
    userEmail: string;
    isVerified: number;
    stories: Stories[];
  }

  interface HighlightResponse extends CommonResponse<HighlightData[]> { }

  export type { HighlightResponse, HighlightData}