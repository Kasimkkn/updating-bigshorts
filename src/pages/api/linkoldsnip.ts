import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { LinkOldVideoResponse } from '@/services/linkoldsnip';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LinkOldVideoResponse>
) {
  if (req.method === 'POST') {
    const { offset = 0, limit = 10 } = req.body;

    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('Authorization token is missing');
      }

      const response = await fetch(API_ENDPOINTS.linkOldVideo.linkOldSnip, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ offset, limit }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }


      const data: LinkOldVideoResponse = await response.json();
         

      res.status(200).json(data);
    } catch (error) {
      console.error('Fetching linkOldSnip failed:', error);
    //   res.status(500).json({
    //     success: false,
    //     message: 'An unexpected error occurred',
    //     data: {
    //       videos: [],
    //       pagination: {
    //         currentPage: 1,
    //         totalPages: 0,
    //         totalItems: 0,
    //       },
    //     },
    //   });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
