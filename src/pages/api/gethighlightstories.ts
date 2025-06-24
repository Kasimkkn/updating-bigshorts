import API_ENDPOINTS from '@/config/apiConfig';
import { HighlightResponse } from '@/models/highlightResponse';
import { GetHighlightDataRequest } from '@/services/gethighlightstories';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<HighlightResponse>) {
  if (req.method === 'POST') {
    try {
      const userData: GetHighlightDataRequest = req.body;
const response = await fetch(API_ENDPOINTS.highlight.getHighlightStories, {
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
      
      const data: HighlightResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching highlight data failed:', error);
      res.status(500).json({
        isSuccess: false, 
        message: 'An unexpected error occurred', 
        data: [] // Assuming HighlightResponse has a data property similar to PostlistResponse
      } as HighlightResponse);
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}