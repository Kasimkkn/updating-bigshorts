import API_ENDPOINTS from '@/config/apiConfig';
import { GetHighlightsRequest, GetHighlightsResponse } from '@/services/getuserhighlights';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetHighlightsResponse>) {
    if (req.method === 'POST') {
        // Extract userData from the request body
        const userData: GetHighlightsRequest = req.body;

        try {
            // Make a POST request to an external API to get highlights
            const response = await fetch(API_ENDPOINTS.highlight.getHighlightList, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`, // Pass authorization header from the request
                },
                body: JSON.stringify(userData),
            });

            // Check if the response is successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the response body and return it
            const data: GetHighlightsResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Error fetching highlights:', error);
            res.status(500).json({
                isSuccess: false,
                message: "An unexpected error occurred",
                data: [],
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
