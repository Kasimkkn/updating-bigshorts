import API_ENDPOINTS from '@/config/apiConfig'
import { GetVideoCountResponse } from '@/services/getvideocountdetails';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetVideoCountResponse>) {
    if (req.method === 'GET') {
        try {

            const response = await fetch(API_ENDPOINTS.post.video.getCount, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: GetVideoCountResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Add friend failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    dislikeCount: 0,
                    likeCount: 0,
                    isDislike: 0,
                    isLiked: 0,
                    isSuperLiked: 0,
                    superLikeCount: 0,
                    videoId: 0,
                    viewCounts: 0
                }
            });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}