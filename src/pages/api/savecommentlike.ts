import API_ENDPOINTS from '@/config/apiConfig'
import { SaveCommentLikeRequest, SaveCommmentLikeResponse } from '@/services/savecommentlike';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<SaveCommmentLikeResponse>) {
    if (req.method === 'POST') {
        const postData: SaveCommentLikeRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.post.comments.like, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SaveCommmentLikeResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Save Post Comment like failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}