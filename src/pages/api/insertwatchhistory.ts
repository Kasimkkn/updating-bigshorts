import API_ENDPOINTS from '@/config/apiConfig'
import { WatchHistoryRequest, WatchHistoryResponse } from '@/services/insertwatchhistory';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<WatchHistoryResponse>) {
  if (req.method === 'POST') {
    const userData = req.body;
    try {
      const response = await fetch(API_ENDPOINTS.flix.miniWatchHistory.insertWatchHistory, {
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

      const data: WatchHistoryResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Insert watch history failed:', error);
      res.status(500).json({
        isSuccess: false,
        message: "Failed to insert watch history",
        data: "",
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}