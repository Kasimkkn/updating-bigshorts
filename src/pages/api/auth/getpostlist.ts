import type { NextApiRequest, NextApiResponse } from 'next';
import API_ENDPOINTS from '@/config/apiConfig';
import { PostlistResponse } from '@/models/postlistResponse';
import { GetPostListRequest } from '@/services/auth/getpostlist'; // Import the request interface

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<PostlistResponse>
) {
  if (req.method === 'POST') {
    const postData: GetPostListRequest = req.body;

    try {
      

      // Make request to backend API
      const response = await fetch(API_ENDPOINTS.post.list, {
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

      const data: PostlistResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Fetching post list failed:', error);
      res.status(500).json({
        isSuccess: false,
        message: 'An unexpected error occurred',
        data: [] // Adjust based on your PostlistResponse structure
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}