import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type CheckUsernameExistRequest = {
    userName: string
}


type CheckUsernameExistResponse = {
    isSuccess: boolean;
    message: string;
    data?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CheckUsernameExistResponse>) {
    if (req.method === 'POST') {
        const checkUsernameData: CheckUsernameExistRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.checkUsernameExist, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(checkUsernameData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CheckUsernameExistResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Username check failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred' });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}