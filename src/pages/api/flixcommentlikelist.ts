import API_ENDPOINTS from '@/config/apiConfig'
import { FlixCommentLikeListRequest, FlixCommentLikeListResponse } from '@/services/flixcommentlikelist';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<FlixCommentLikeListResponse>) {
    if (req.method === 'POST') {
        const userData: FlixCommentLikeListRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.flix.comments.likeList, {
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

            const data: FlixCommentLikeListResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Post List failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: "",
                data: "",
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}