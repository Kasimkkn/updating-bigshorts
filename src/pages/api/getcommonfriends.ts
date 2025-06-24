import API_ENDPOINTS from '@/config/apiConfig'
import { GetMutualFriendsRequest, GetMutualFriendsResponse } from '@/services/getcommonfriends';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetMutualFriendsResponse>) {
    if (req.method === 'POST') {
        const userData: GetMutualFriendsRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.getMutualFriends, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: GetMutualFriendsResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('get common friends failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: "",
                data: {mutualFriends: [], othersCount: 0},
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}