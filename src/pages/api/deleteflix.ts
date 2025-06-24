import API_ENDPOINTS from '@/config/apiConfig'
import { DeleteFlixRequest, DeleteFlixResponse } from '@/services/deleteflix';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeleteFlixResponse>) {
    if (req.method === 'POST') {
        const deleteData: DeleteFlixRequest = req.body;

        try {
            const response = await fetch(API_ENDPOINTS.flix.delete, {
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

            const data: DeleteFlixResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Delete flix failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}