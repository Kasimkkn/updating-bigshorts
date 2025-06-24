import API_ENDPOINTS from '@/config/apiConfig'
import { CreatePostResponse } from '@/services/createpostnewfors3';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<CreatePostResponse>) {
    if (req.method === 'POST') {
        const addFriendData = req.body;

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
              return res.status(401).json({
                isSuccess: false,
                message: 'No authentication token provided',
                data: "" // Add empty data to match the type
              });
            }
            const token = authHeader.split(' ')[1];
            const response = await fetch(API_ENDPOINTS.post.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,

                },
                body: JSON.stringify(addFriendData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CreatePostResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Create Post Failed failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}