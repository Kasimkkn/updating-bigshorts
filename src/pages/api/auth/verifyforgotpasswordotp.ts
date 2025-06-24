import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type VerifyForgotPasswordOtpRequest = {
    username: string,
    userId?: number,
    otp: number,
    otpId?: number
}

type VerifyOtpForgotResponse = {
    isSuccess: boolean;
    message: string;
    data: {
        username: string;
        userId: number;
        otpId: number;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyOtpForgotResponse>) {
    if (req.method === 'POST') {
        const verfiyOtpData: VerifyForgotPasswordOtpRequest = req.body;

        try {
            const response = await fetch(API_ENDPOINTS.auth.otpVerifyForgot, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verfiyOtpData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: VerifyOtpForgotResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('verify otp failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred', data: { username: '', userId: 0, otpId: 0 } });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}