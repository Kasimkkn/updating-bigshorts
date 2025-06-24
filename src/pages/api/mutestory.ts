import API_ENDPOINTS from '@/config/apiConfig'
import { MuteStoryRequest, MuteStoryResponse } from '@/services/mutestory';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<MuteStoryResponse>) {
    if (req.method === 'POST') {
        const muteStoryData: MuteStoryRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.stories.mute, {
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

            const data: MuteStoryResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Mute story failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}