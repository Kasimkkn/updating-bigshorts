import API_ENDPOINTS from '@/config/apiConfig'
import { MiniWatchHistoryResponse } from '@/services/getminiwatchhistory';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<MiniWatchHistoryResponse>) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(API_ENDPOINTS.flix.miniWatchHistory.getWatchHistory, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${req.headers.authorization}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MiniWatchHistoryResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Mini Watch History fetch failed:', error);
      res.status(500).json({
        isSuccess: false,
        message: 'An unexpected error occurred',
        data: {
          history: [],
          pagination: {
            total: 0,
            limit: 0,
            offset: 0,
            hasMore: false
          }
        }
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}