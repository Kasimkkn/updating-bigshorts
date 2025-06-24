import API_ENDPOINTS from '@/config/apiConfig'
import { UnfollowRequest, UnfollowResponse } from '@/services/removefollower';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<UnfollowResponse>) {
    if (req.method === 'POST') {
        const addFriendData: UnfollowRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.removeFollower, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(addFriendData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: UnfollowResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Remove follower failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}