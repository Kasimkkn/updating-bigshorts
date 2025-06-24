import API_ENDPOINTS from '@/config/apiConfig'
import { TrendingCreatorsResponse } from '@/services/trendingcreators';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<TrendingCreatorsResponse>) {
    if (req.method === 'GET') {
        try {

            const response = await fetch(API_ENDPOINTS.shared.trendingCreators, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TrendingCreatorsResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('App Suggesting List failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    userFullName: "",
                    isFollowing: 0,
                    isVerified: 0,
                    totalFollowers: "",
                    userId: 0,
                    userName: "",
                    userProfileImage: ""
                }
            });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}