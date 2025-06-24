import API_ENDPOINTS from '@/config/apiConfig'
import { StoryInsightsResponse } from '@/services/getstoryinsights';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<StoryInsightsResponse>) {
    if (req.method === 'GET') {
        try {
   const storyId = req.headers['x-story-id'];
            const response = await fetch(`${API_ENDPOINTS.stories.getInsights}?storyId=${storyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: StoryInsightsResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Add friend failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    accountEngaged: 0,
                    accountReached: 0,
                    followerReach: 0,
                    nonFollowerReach: 0,
                    profileActivity: 0,
                    profileFollows: 0,
                    profileVisits: 0,
                    totalReach: 0,
                    totalReplies: 0,
                    totalReaction: 0,
                    totalShare: 0
                }
            });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}