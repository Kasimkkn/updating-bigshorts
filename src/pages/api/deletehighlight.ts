import API_ENDPOINTS from '@/config/apiConfig';
import { DeleteHighlightRequest, DeleteHighlightResponse } from '@/services/deletehighlight';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<DeleteHighlightResponse>
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const deleteData: DeleteHighlightRequest = req.body;

    try {
        const response = await fetch(API_ENDPOINTS.highlight.delete, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${req.headers.authorization}`,
            },
            body: JSON.stringify(deleteData),
        });

        const data = await response.json();

        // Pass through the encrypted response
        return res.status(200).json(data);

    } catch (error) {
        console.error('Delete highlight failed:', error);
        return res.status(500).json({
            isSuccess: false,
            message: 'An unexpected error occurred',
            data: ""
        });
    }
}