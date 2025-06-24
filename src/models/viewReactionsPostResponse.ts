import { CommonResponse } from "./commonResponse";

export interface ViewReactionsPostResponse extends CommonResponse<ViewReactionsPostData> {}

export interface ViewReactionsPostData {
  postId?: number;
  reactions?: Reactions;
  comments?: Comments;
  shares?: Shares;
  visitors?: Visitors;
}

export interface Reactions {
  likes?: Likes;
  superLikes?: Likes;
}

export interface Likes {
  total?: number;
  followers?: number;
  nonFollowers?: number;
  ageCategories?: AgeCategories;
  timeCategories?: TimeCategories;
}

export interface AgeCategories {
  under18?: number;
  from18to24?: number;
  from25to34?: number;
  from35to44?: number;
  from45to54?: number;
  over54?: number;
}

export interface TimeCategories {
  "12to6"?: number;
  "6to12"?: number;
  "12to18"?: number;
  "18to12"?: number;
}

export interface Comments {
  total?: number;
  followers?: number;
  nonFollowers?: number;
}

export interface Shares {
  total?: number;
  followers?: number;
  nonFollowers?: number;
  byPlatform?: SharesByPlatform;
}

export interface SharesByPlatform {
  followers?: { [key: string]: number };
  nonFollowers?: { [key: string]: number };
}

export interface Visitors {
  total?: number;
  followers?: number;
  nonFollowers?: number;
}