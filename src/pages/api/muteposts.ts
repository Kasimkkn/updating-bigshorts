import API_ENDPOINTS from '@/config/apiConfig'
import { MutePostRequest, MutePostResponse } from '@/services/muteposts';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<MutePostResponse>) {
    if (req.method === 'POST') {
        const muteStoryData: MutePostRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.post.mute, {
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

            const data: MutePostResponse = await response.json();
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