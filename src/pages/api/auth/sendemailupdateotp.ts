import API_ENDPOINTS from '@/config/apiConfig';
import { SendEmailUpdateOtpRequest, SendEmailUpdateOtpResponse } from '@/services/auth/sendemailupdateotp';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<SendEmailUpdateOtpResponse>) {
    if (req.method === 'POST') {
        const updateEmailData: SendEmailUpdateOtpRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.updateEmail, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateEmailData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SendEmailUpdateOtpResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Email update failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred', data: { username: '', otpId: 0 } });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}