import API_ENDPOINTS from '@/config/apiConfig'
import { ProfileFollowerListResponse } from '@/models/profileResponse';
import { FollowerListUserRequest } from '@/services/userfriendlist';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProfileFollowerListResponse>) {
    if (req.method === 'POST') {
        const followerListData: FollowerListUserRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.getFriendList, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(followerListData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ProfileFollowerListResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Fan list failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    userId: 0,
                    friendId: 0,
                    friendUserName: "",
                    friendName: "",
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