import API_ENDPOINTS from '@/config/apiConfig';
import { HashtagSearchRequest, HashtagSearchResponse } from '@/services/hashtagsearch';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<HashtagSearchResponse>) {
    if (req.method === 'POST') {
        const userData: HashtagSearchRequest = req.body;

        try {
            // Extract the Authorization token from request headers
            const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

            if (!token) {
                throw new Error('Authorization token is missing');
            }

            const response = await fetch(API_ENDPOINTS.shared.searchHashtag, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Use token extracted from headers
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: HashtagSearchResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Hashtag search failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: 'An unexpected error occurred',
                data: [], // You can modify this structure as per your expected response shape
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
