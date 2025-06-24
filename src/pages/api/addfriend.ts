import API_ENDPOINTS from '@/config/apiConfig'
import { AddFriendRequest, AddFriendResponse } from '@/services/addfriend';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<AddFriendResponse>) {
    if (req.method === 'POST') {
        const addFriendData: AddFriendRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.addFriend, {
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

            const data: AddFriendResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Add friend failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}