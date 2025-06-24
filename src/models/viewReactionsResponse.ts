import { CommonResponse } from "./commonResponse";

export interface ViewReactionsResponse extends CommonResponse<ViewReactionsData> {}

export interface ViewReactionsData {
    postId: number;
    videoIds: number[];
    createdAt: string;
    totalVideos: number;
    views?: Views;
    reactions?: Reactions;
    comments?: Comments;
    shares?: Shares;
    visitors?: Visitors;
    ageCategories?: AgeCategories;
}

export interface Views {
    viewCount: number;
    followers: number;
    nonFollowers: number;
    ageCategories?: AgeCategories;
    timeCategories?: TimeCategories;
}

export interface Reactions {
    likes?: ReactionDetail;
    superLikes?: ReactionDetail;
}

export interface ReactionDetail {
    total: number;
    followers: number;
    nonFollowers: number;
    ageCategories?: AgeCategories;
    timeCategories?: TimeCategories;
}

export interface Comments {
    total: number;
    followers: number;
    nonFollowers: number;
    ageCategories?: AgeCategories;
    timeCategories?: TimeCategories;
}

export interface Shares {
    total: number;
    followers: number;
    nonFollowers: number;
    byPlatform?: ByPlatform;
}

export interface ByPlatform {
    followers?: { [key: string]: number };
    nonFollowers?: { [key: string]: number };
}

export interface Visitors {
    total: number;
    followers: number;
    nonFollowers: number;
}

export interface AgeCategories {
    under18: number;
    from18to24: number;
    from25to34: number;
    from35to44: number;
    from45to54: number;
    over54: number;
}

export interface TimeCategories {
    "12to6": number;
    "6to12": number;
    "12to18": number;
    "18to12": number;
}