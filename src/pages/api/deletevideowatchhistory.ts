import API_ENDPOINTS from '@/config/apiConfig'
import { CommonResponse } from '@/models/commonResponse';
import type { NextApiRequest, NextApiResponse } from 'next'

interface DeleteVideoHistoryResponse extends CommonResponse<{ success: boolean }> {}

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeleteVideoHistoryResponse>) {
  if (req.method === 'DELETE') {
    try {
      const flixId = req.headers['flixid'];
const response = await fetch(`${API_ENDPOINTS.flix.miniWatchHistory.deleteVideo}/${flixId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${req.headers.authorization}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DeleteVideoHistoryResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error deleting video from watch history:', error);
      res.status(500).json({
        isSuccess: false,
        message: 'Failed to delete video from watch history',
        data: { success: false }
      });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}