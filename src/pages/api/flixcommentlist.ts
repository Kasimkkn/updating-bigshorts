import API_ENDPOINTS from '@/config/apiConfig'
import { FlixCommentRequest, PostCommnetListResponse } from '@/services/flixcommentlist';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<PostCommnetListResponse>) {
    if (req.method === 'POST') {
        const userData: FlixCommentRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.flix.comments.list, {
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

            const data: PostCommnetListResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Post List failed:', error);
            res.status(500).json({
                data: [],
                isSuccess: false,
                message: 'An unexpected error occurred'
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}