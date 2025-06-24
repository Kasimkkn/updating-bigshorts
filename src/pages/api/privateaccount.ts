import API_ENDPOINTS from '@/config/apiConfig'
import { PrivateAccountResponse } from '@/services/privateaccount';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<PrivateAccountResponse>) {
    if (req.method === 'GET') {
        try {

            const response = await fetch(API_ENDPOINTS.userProfile.setPrivateAccount, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: PrivateAccountResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Private Account failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {}
            });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}