import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type GetPostListRequest = {
  isForYou: string;
  isForInteractiveImage?: string;
  isForInteractiveVideo?: string;
  isForVideo?: string;
  isForAll?: string;
  limit?: number;
  page?: number;
  isFromFeedTab?: boolean;
  isLogin?: number;
}

type GetPostListResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    totalCount: number;
    posts: any[]; // Replace 'any' with the actual post type if known
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetPostListResponse>) {
  if (req.method === 'POST') {
    const postData: GetPostListRequest = req.body;
    try {
      const response = await fetch(API_ENDPOINTS.flix.list, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${req.headers.authorization}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetPostListResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching post list:', error);
      res.status(500).json({ 
        isSuccess: false, 
        message: 'An unexpected error occurred',
        data: {
          totalCount: 0,
          posts: []
        }
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}