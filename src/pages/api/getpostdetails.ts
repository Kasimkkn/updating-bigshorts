import API_ENDPOINTS from '@/config/apiConfig'
import { PostlistResponse } from '@/models/postlistResponse';
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse<PostlistResponse>) {
    if (req.method === 'GET') {
        try {
 // Access headers with lowercase keys
 const postId = req.headers['postid'];  // Use lowercase headers
 const userId = req.headers['userid'];
 // Log the extracted values
// Check if both postId and userId are present
 if (!postId ) {
     return res.status(400).json({
         isSuccess: false,
         message: 'postId required',
         data: [],
     });
 }
const response = await fetch(`${API_ENDPOINTS.post.details}?id=${postId}&userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: PostlistResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('User Post details failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: []
            });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}
