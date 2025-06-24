import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type SendForgotPasswordOtpRequest = {
    username: string;
}

type SendForgotPasswordOtpResponse = {
    isSuccess: boolean;
    message: string;
    data?: {
        userId: number,
        username: string,
        otp: number,
        otpId: number,
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SendForgotPasswordOtpResponse>) {
    if (req.method === 'POST') {
        const forgotPasswordData: SendForgotPasswordOtpRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(forgotPasswordData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SendForgotPasswordOtpResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Forgot password failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred' });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}