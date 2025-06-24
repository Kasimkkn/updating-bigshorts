import API_ENDPOINTS from '@/config/apiConfig'
import { StoryViewerResponse } from '@/services/getstoryviewer';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<StoryViewerResponse>) {
   if (req.method === 'GET') {
    const storyId = req.headers['x-story-id']; 
       try {
           const response = await fetch(`${API_ENDPOINTS.stories.getStoryViewrList}?storyId=${storyId}`, {
               method: 'GET',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `${req.headers.authorization}`,
               },
           });

           if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
           }

           const data: StoryViewerResponse = await response.json();
           res.status(200).json(data);
       } catch (error) {
           console.error('Get story viewers failed:', error);
           res.status(500).json({
               isSuccess: false,
               message: 'An unexpected error occurred',
               data: [] // Empty array for error case
           });
       }
   } else {
       res.setHeader('Allow', ['GET']);
       res.status(405).end(`Method ${req.method} Not Allowed`);
   }
}