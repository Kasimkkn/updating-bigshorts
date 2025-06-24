import { CommonResponse } from "./commonResponse";

export interface NotificationData {
    userId: number;
    userName: string;
    userImage: string;
    postId: number;
    postTitle: string;
    coverFileName: string;
    isForInteractiveImage: string;
    isForInteractiveVideo: string;
    notificationType: string;
    notificationDetail: string;
    notificationTime: string;
    isFriend: number;
    isPrivateAccount: number;
    isRequested: number;
    isAccepted: number;
}

export interface NotificationResponse extends CommonResponse<NotificationData> { }

export interface FollowRequestData {
    user_id: number,
    username: string,
    profileimage: string,
    createdAt: string
}

export interface FollowRequestResponse extends CommonResponse<FollowRequestData> { }
