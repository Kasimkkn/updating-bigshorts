export interface ProfileData {
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
    isUserFriend:number,
    socialMediaLinks: [],
    isBigshortsOriginal: number,
}

export type FollowingModalData = {
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

export type FollowerModalData = {
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


export type SuggestionListForUserData = {
    userId: number,
    userName: string,
    userFullName: string,
    userProfileImage: string,
    totalFollowers: string,
    isVerified: number,
    isRequested: number
}
export type TrendingCreatorsData = {
    userId: number,
    userName: string,
    userFullName: string,
    userProfileImage: string,
    totalFollowers: string,
    isVerified: number,
    isFollowing: number
}