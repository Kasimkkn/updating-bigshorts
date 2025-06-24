import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type OtpVerifyRequest = {
    username: string;
    otpId?: number;
    otp: number;
    registration_type: 1 | 2;
}


type OtpVerifyResponse = {
    isSuccess: boolean;
    message: string;
    data?: {
        username: string;
        otpId: number;
        registration_type: 1 | 2;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<OtpVerifyResponse>) {
    if (req.method === 'POST') {
        const otpVerifyData: OtpVerifyRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.otpVerify, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(otpVerifyData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: OtpVerifyResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('OTP verification failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred' });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}