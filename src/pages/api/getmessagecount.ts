import API_ENDPOINTS from '@/config/apiConfig'
import { MessageCountResponse } from '@/services/getmessagecount';
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse<MessageCountResponse>) {
    if (req.method === 'GET') {
        try {

            const response = await fetch(API_ENDPOINTS.shared.messageCount, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: MessageCountResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Error Getting Message Count failed:', error);
            res.status(500).json({
                data: [
                    {
                        count: ""
                    }
                ],
                isSuccess: false,
                message: 'An unexpected error occurred',
            });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}
