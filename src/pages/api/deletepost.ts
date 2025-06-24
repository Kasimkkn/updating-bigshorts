import API_ENDPOINTS from '@/config/apiConfig'
import { DeletePostRequest, DeletePostResponse } from '@/services/deletepost';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeletePostResponse>) {
    if (req.method === 'POST') {
        const deleteData: DeletePostRequest = req.body;

        try {
            const response = await fetch(API_ENDPOINTS.post.delete, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(deleteData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: DeletePostResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Delete post failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}