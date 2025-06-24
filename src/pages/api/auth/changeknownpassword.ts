import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type ChangeKnownPasswordRequest = {

    current_password: string,
    new_password: string,
    confirm_password: string
}


type ChangeKnownPasswordResponse = {
    isSuccess: boolean;
    message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChangeKnownPasswordResponse>) {
    if (req.method === 'POST') {
        const changePasswordData: ChangeKnownPasswordRequest = req.body;
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    isSuccess: false,
                    message: 'No authentication token provided',

                });
            }

            const token = authHeader.split(' ')[1]; // Extract token
            const response = await fetch(API_ENDPOINTS.auth.changeKnownPassword, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(changePasswordData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ChangeKnownPasswordResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Change password failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred' });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}