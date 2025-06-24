import API_ENDPOINTS from '@/config/apiConfig';
import { SendPhoneUpdateOtpRequest, SendPhoneUpdateOtpResponse } from '@/services/auth/sendphoneupdateotp';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<SendPhoneUpdateOtpResponse>) {
    if (req.method === 'POST') {
        const updatePhoneData: SendPhoneUpdateOtpRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.updatePhone, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePhoneData),
            });


            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SendPhoneUpdateOtpResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Phone update failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred', data: { username: '', otpId: 0 } });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}