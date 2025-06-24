import API_ENDPOINTS from '@/config/apiConfig'
import { BlockedUsersReponse } from '@/services/getblockedusers';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<BlockedUsersReponse>) {
    if (req.method === 'GET') {
        try {

            const response = await fetch(API_ENDPOINTS.settings.getBlockedUsers, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: BlockedUsersReponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Muted Users failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: []
            });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}