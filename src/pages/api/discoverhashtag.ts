import API_ENDPOINTS from '@/config/apiConfig';
import { PostlistResponse } from '@/models/postlistResponse';
import { Hashtag } from '@/services/discoverhashtag';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Hashtag | { isSuccess: boolean; message: string; data: [] }>) {
    if (req.method === 'POST') {
        const { hashTagId } = req.body;

        if (!hashTagId) {
            return res.status(400).json({
                isSuccess: false,
                message: 'Missing hashTagId in request body',
                data: [],
            });
        }

        try {
            const response = await fetch(API_ENDPOINTS.post.hashtag, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify({ hashTagId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Hashtag = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Hashtag fetch failed:', error);
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