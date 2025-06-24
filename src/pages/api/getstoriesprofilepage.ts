import API_ENDPOINTS from '@/config/apiConfig'
import { StoryResponse } from '@/models/storyResponse';
import { GetStoryDataRequest } from '@/services/getstoriesprofilepage';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<StoryResponse>) {
    if (req.method === 'POST') {
        const userData: GetStoryDataRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.stories.getProfile, {
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

            const data: StoryResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('User Story details failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: []
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}
