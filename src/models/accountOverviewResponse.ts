export interface PostInteractions {
    videoLikeUsers: number;
    postLikeUsers: number;
    postCommentUsers: number;
    postSaveUsers: number;
    postShareUsers: number;
}

export interface FlixInteractions {
    flixLikeUsers: number;
    flixCommentUsers: number;
    flixSaveUsers: number;
    flixShareUsers: number;
}

export interface DistinctUserInteractions {
    postInteractions: PostInteractions;
    flixInteractions: FlixInteractions;
}

export interface AccountOverviewData {
    userProfileImage: string;
    userName: string;
    contentShared: number;
    totalPost: number;
    totalFlix: number;
    totalFollowers: number;
    accountsReached: number;
    distinctUserInteractions: DistinctUserInteractions;
    totalEngagement: number;
}

export interface AccountOverviewResponse {
    success: boolean;
    message: string;
    data: AccountOverviewData;
}