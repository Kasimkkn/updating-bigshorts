import API_ENDPOINTS from '@/config/apiConfig'
import { StoryReplyRequest, StoryReplyResponse } from '@/services/storyreply';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<StoryReplyResponse>) {
    if (req.method === 'POST') {
        const storyReplyData: StoryReplyRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.stories.reaction, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(storyReplyData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: StoryReplyResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Story reaction failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}