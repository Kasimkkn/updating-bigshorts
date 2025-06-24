import API_ENDPOINTS from '@/config/apiConfig'
import { CreateHighlightResponse, CreateHighlightData } from '@/services/createhighlight';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<CreateHighlightResponse>) {
    if (req.method === 'POST') {
        const highlightData: CreateHighlightData = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.highlight.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(highlightData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CreateHighlightResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Create Highlight failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}