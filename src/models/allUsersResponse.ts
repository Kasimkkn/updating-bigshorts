import { CommonResponse } from "./commonResponse";

export interface AllUsersInfo {
  userId: number;
  userName: string;
  userFullName: string;
  userProfileImage: string;
  isVerified: number;
  isFollow: number;
  isPrivateAccount: number;
  isAllowNotification: number;
  isAllowTagging: number;
  isBlock: number;
}

export interface AllUsersResponse extends CommonResponse<AllUsersInfo[]> {}

// Default values equivalent to Dart model
export const defaultAllUsersInfo: AllUsersInfo = {
  userId: -1,
  userName: "",
  userFullName: "",
  userProfileImage: "",
  isVerified: -1,
  isFollow: 0,
  isPrivateAccount: 0,
  isAllowNotification: 0,
  isAllowTagging: 0,
  isBlock: 0
};