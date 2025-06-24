import API_ENDPOINTS from '@/config/apiConfig'
import { SaveUserBlockRequest, SaveUserBlockResponse } from '@/services/saveuserblock';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<SaveUserBlockResponse>) {
    if (req.method === 'POST') {
        const muteStoryData: SaveUserBlockRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.blockUser, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(muteStoryData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SaveUserBlockResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('unblocking user  failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}