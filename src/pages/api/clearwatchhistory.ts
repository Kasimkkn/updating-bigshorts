import API_ENDPOINTS from '@/config/apiConfig'
import { CommonResponse } from '@/models/commonResponse';
import type { NextApiRequest, NextApiResponse } from 'next'

interface ClearWatchHistoryResponse extends CommonResponse<{ success: boolean }> {}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ClearWatchHistoryResponse>) {
  if (req.method === 'DELETE') {
    try {
      const response = await fetch(`${API_ENDPOINTS.flix.miniWatchHistory.clear}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${req.headers.authorization}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ClearWatchHistoryResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error clearing watch history:', error);
      res.status(500).json({
        isSuccess: false,
        message: 'Failed to clear watch history',
        data: { success: false }
      });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}