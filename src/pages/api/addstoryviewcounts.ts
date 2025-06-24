import API_ENDPOINTS from '@/config/apiConfig'
import { AddStoryViewCountsRequest, AddStoryViewCountsResponse } from '@/services/addstoryviewcounts';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<AddStoryViewCountsResponse>) {
    if (req.method === 'POST') {
        const addStoryViewCountsData: AddStoryViewCountsRequest = req.body;

        try {
            const response = await fetch(API_ENDPOINTS.stories.addViewCount, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(addStoryViewCountsData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AddStoryViewCountsResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Add story view counts failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}