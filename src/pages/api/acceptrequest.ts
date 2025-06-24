import API_ENDPOINTS from '@/config/apiConfig'
import { AcceptFriendRequest, AcceptFriendResponse } from '@/services/acceptrequest';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<AcceptFriendResponse>) {
    if (req.method === 'POST') {
        const acceptFriendData: AcceptFriendRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.acceptFriend, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(acceptFriendData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AcceptFriendResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Accept friend failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}