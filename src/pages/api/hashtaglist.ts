import API_ENDPOINTS from '@/config/apiConfig';
import { HashtagItem } from '@/services/hashtaglist';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<HashtagItem[] | { isSuccess: boolean; message: string; data: [] }>) {
    if (req.method === 'POST') {
        const { hashTag } = req.body;

        /*if (!hashTag) {
            return res.status(400).json({
                isSuccess: false,
                message: 'Missing hashTag in request body',
                data: [],
            });
        }*/

        try {
            const response = await fetch(API_ENDPOINTS.shared.hashtagList, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify({ hashTag }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            res.status(200).json(result.data);
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
