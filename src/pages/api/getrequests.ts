import API_ENDPOINTS from '@/config/apiConfig'
import { FollowRequestResponse } from '@/models/notficationResponse';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<FollowRequestResponse>) {
    if (req.method === 'POST') {
        try {

            const response = await fetch(API_ENDPOINTS.shared.requests, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: FollowRequestResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Fan list failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    user_id: 0,
                    username: "",
                    createdAt: "",
                    profileimage: "",
                }
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}