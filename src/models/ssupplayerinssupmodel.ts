import { Stories, StoryData } from "@/types/storyTypes";

location

export interface SsupPlayerInSsupModel {
  ssupItem?: StoryData | null;
  positionX?: number | null;
  positionY?: number | null;
  scale?: number | null;
}

export function ssupPlayerInSsupModelFromJson(json: any): SsupPlayerInSsupModel {
  return {
    ssupItem: json.ssupItem ? storyDataFromJson(json.ssupItem) : null,
    positionX: json.positionX ?? null,
    positionY: json.positionY ?? null,
    scale: json.scale ?? null
  };
}

// Function to parse StoryData from JSON
function storyDataFromJson(json: any): StoryData {
  return {
    userId: json.userId ?? 0,
    userProfileImage: json.userProfileImage ?? '',
    userFullName: json.userFullName ?? '',
    userName: json.userName ?? '',
    userMobileNo: json.userMobileNo ?? '',
    userEmail: json.userEmail ?? '',
    isVerified: json.isVerified ?? 0,
    isMuted: json.isMuted ?? 0,
    stories: Array.isArray(json.stories) ? json.stories.map(storyFromJson) : [],
    isFriend: json.isFriend ?? 0,
  };
}

// Helper function to parse individual Stories items
function storyFromJson(json: any): Stories {
  return {
    postId: json.postId ?? 0,
    postTitle: json.postTitle ?? '',
    languageId: json.languageId ?? 0,
    coverFile: json.coverFile ?? '',
    isAllowComment: json.isAllowComment ?? 0,
    isPosted: json.isPosted ?? 0,
    scheduleTime: json.scheduleTime ?? '',
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
    isRead: json.isRead ?? 0,
    storyEndTime: json.storyEndTime ?? '',
    taggedUser: Array.isArray(json.taggedUser) ? json.taggedUser : []
  };
}