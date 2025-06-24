import API_ENDPOINTS from '@/config/apiConfig'
import { ViewReactionsPostResponse } from '@/models/viewReactionsPostResponse';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ViewReactionsPostResponse>) {
  if (req.method === 'POST') {
    const reqData = req.body;
    try {
      const response = await fetch(API_ENDPOINTS.post.insights.getImagePostInsights, {
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

      const data: ViewReactionsPostResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching image post insights:', error);
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}