import API_ENDPOINTS from '@/config/apiConfig'
import { ViewReactionsResponse } from '@/models/viewReactionsResponse';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ViewReactionsResponse>) {
  if (req.method === 'POST') {
    const reqData = req.body;
    try {
      const response = await fetch(API_ENDPOINTS.post.insights.getinsights, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${req.headers.authorization}`,
        },
        body: JSON.stringify(reqData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ViewReactionsResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    //   res.status(500).json({
    //     isSuccess: false, 
    //     message: 'An unexpected error occurred', 
    //     data: {
    //       postId: 0,
    //       videoId: 0,
    //       views: 0,
    //       reactions: []
    //     }
    //   });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}