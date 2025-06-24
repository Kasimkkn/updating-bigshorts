import API_ENDPOINTS from '@/config/apiConfig'
import { PostCommentRequest, PostCommnetListResponse } from '@/services/postcommentlist';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<PostCommnetListResponse>) {
    if (req.method === 'POST') {
        const userData: PostCommentRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.post.comments.list, {
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
                isSuccess: false, message: 'An unexpected error occurred', data: []
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}