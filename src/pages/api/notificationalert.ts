import API_ENDPOINTS from '@/config/apiConfig'
import { notificationalertResponse } from '@/services/notificationalert';
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse<notificationalertResponse>) {
    if (req.method === 'GET') {
        try {

            const response = await fetch(API_ENDPOINTS.shared.notifications.alert, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: notificationalertResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            res.status(500).json({
                data: [],
                isSuccess: false,
                message: 'An unexpected error occurred',
            });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}
