import { PostlistItem } from '@/models/postlistResponse';
import { ImageSaved, VideoSaved, MusicSaved } from '@/types/savedTypes';

// Base properties that all post types should have
export interface BasePostProperties {
    postId: number;
    userId: number;
    userName: string;
    userFullName?: string;
    userProfileImage: string;
    postTitle?: string;
    postTagUser?: any[];
    collaboratorCount?: number;
    firstCollaboratorName?: string;
    postLocation?: Array<{ locationName: string }>;
    isFriend?: boolean;
    isLiked?: number;
    isSuperLiked?: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    isSaved: number;
    saveCount: number;
    isAllowComment?: number;
    scheduleTime?: string;
}

// Extended MusicSaved type with required properties
export interface ExtendedMusicSaved extends MusicSaved, BasePostProperties { }

// Union type for all post types
export type UnifiedPostType = PostlistItem | ImageSaved | VideoSaved | ExtendedMusicSaved;

// Type guard functions
export const isPostlistItem = (post: UnifiedPostType): post is PostlistItem => {
    return 'isForInteractiveVideo' in post || 'isForInteractiveImage' in post;
};

export const isImageSaved = (post: UnifiedPostType): post is ImageSaved => {
    return 'coverFile' in post && !('videoFile' in post) && !('audioFile' in post);
};

export const isVideoSaved = (post: UnifiedPostType): post is VideoSaved => {
    return 'videoFile' in post && Array.isArray((post as VideoSaved).videoFile);
};

export const isMusicSaved = (post: UnifiedPostType): post is ExtendedMusicSaved => {
    return 'audioFile' in post && 'audioName' in post;
};
