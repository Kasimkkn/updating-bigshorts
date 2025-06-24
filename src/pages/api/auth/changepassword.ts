import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type ChangePasswordRequest = {
    username: string
    userId: number,
    otpId: number,
    new_password: string,
    confirm_password: string
}


type ChangePasswordResponse = {
    isSuccess: boolean;
    message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChangePasswordResponse>) {
    if (req.method === 'POST') {
        const changePasswordData: ChangePasswordRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.changePassword, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changePasswordData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ChangePasswordResponse = await response.json();
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