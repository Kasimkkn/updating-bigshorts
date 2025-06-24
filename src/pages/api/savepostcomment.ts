import API_ENDPOINTS from '@/config/apiConfig'
import { SavePostCommentRequest, SavePostCommmentResponse } from '@/services/savepostcomment';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<SavePostCommmentResponse>) {
    if (req.method === 'POST') {
        const postData: SavePostCommentRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.post.comments.save, {
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

            const data: SavePostCommmentResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Save Post Comment failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}