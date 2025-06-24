import API_ENDPOINTS from '@/config/apiConfig'
import { RemoveStoryResponse, RemoveStoryViewRequest } from '@/services/removestoryviewrestriction';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<RemoveStoryResponse>) {
    if (req.method === 'POST') {
        const removeStoryData: RemoveStoryViewRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.stories.removeViewRestriction, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(removeStoryData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: RemoveStoryResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Remove story failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}