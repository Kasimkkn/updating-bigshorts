import API_ENDPOINTS from '@/config/apiConfig';
import { VerifyContactChangeOtpRequest, VerifyContactChangeOtpResponse } from '@/services/auth/verifycontactchangeotp';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyContactChangeOtpResponse>) {
    if (req.method === 'POST') {
        const otpVerifyData: VerifyContactChangeOtpRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.contactChangeOtpVerify, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(otpVerifyData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: VerifyContactChangeOtpResponse = await response.json();
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