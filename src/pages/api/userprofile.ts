import API_ENDPOINTS from '@/config/apiConfig'
import { ProfileResponse } from '@/models/profileResponse';
import { ProfileRequest } from '@/services/userprofile';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProfileResponse>) {
    if (req.method === 'POST') {
        const changePasswordData: ProfileRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.getProfile, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(changePasswordData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ProfileResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Change password failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    userId: 0,
                    userFullName: '',
                    userPronouns: '',
                    userEmail: '',
                    isContactViaEmail: 0,
                    isContactViaPhone: 0,
                    userMobile: '',
                    userName: '',
                    userRoleId: 0,
                    userProfileImage: '',
                    userBirthdate: '',
                    userGender: '',
                    userProfileBio: '',
                    userWebsiteLink: '',
                    isVerified: 0,
                    userRole: '',
                    totalFollowing: 0,
                    totalHeart: 0,
                    totalFan: 0,
                    isPrivateAccount: 0,
                    isAllowNotification: 0,
                    isAllowTagging: 0,
                    aboutUsLink: '',
                    helpLink: '',
                    faqLink: '',
                    totalUserPostCount: 0,
                    isAllowUserNotification: 0,
                    isFacebookConnected: 0,
                    isInstagramConnected: 0,
                    isTweeterConnected: 0,
                    isYoutubeConnected: 0,
                    facebookId: '',
                    instagramId: '',
                    tweeterId: '',
                    youtubeId: '',
                    verificationLink: '',
                    frequentlyAskedQuestionsLink: '',
                    privacyPolicy: '',
                    termsAndConditions: '',
                    clientEmail: '',
                    isBlock: 0,
                    isStoryMuted: 0,
                    isRequested: 0,
                    hasRequested: 0,
                    isFriend: 0,
                    socialMediaLinks: [],
                    isBigshortsOriginal: 0
                }
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}