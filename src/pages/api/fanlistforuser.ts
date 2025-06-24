import API_ENDPOINTS from '@/config/apiConfig'
import { ProfileFollowingListResponse } from '@/models/profileResponse';
import { FanListForUserRequest } from '@/services/fanlistforuser';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProfileFollowingListResponse>) {
    if (req.method === 'POST') {
        const fanListData: FanListForUserRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.getFanList, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(fanListData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ProfileFollowingListResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Fan list failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    userId: 0,
                    userName: "",
                    userFullName: "",
                    userProfileImage: "",
                    isVerified: 0,
                    isAllowNotification: 0,
                    isAllowTagging: 0,
                    isPrivate: 0,
                    isFollow: 0,
                    isRequested: 0
                }
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}