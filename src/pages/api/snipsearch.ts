import API_ENDPOINTS from '@/config/apiConfig';
import { PostlistResponse } from '@/models/postlistResponse';
import { SnipSearchRequest, SnipSearchResponse } from '@/services/snipsearch';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<PostlistResponse>) {
    if (req.method === 'POST') {
        const userData: SnipSearchRequest = req.body;

        try {
            const response = await fetch(API_ENDPOINTS.flix.snip, {
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

            const data: PostlistResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('SnipSearch failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: '',
                data: [],
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}