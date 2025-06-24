import API_ENDPOINTS from '@/config/apiConfig'
import { GenreListResponse, Genre } from '@/services/genrelist';
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<GenreListResponse>) {
  if (req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          isSuccess: false,
          message: 'No authentication token provided',
          data: []
        });
      }

      const response = await fetchWithDecryption(API_ENDPOINTS.flix.getGenreList.genrelist, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${req.headers.authorization}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GenreListResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Genre list fetch failed:', error);
      res.status(500).json({
        isSuccess: false,
        message: 'An unexpected error occurred',
        data: []
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}