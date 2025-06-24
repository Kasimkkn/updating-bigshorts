import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type SignUpRequest = {
    username: string;
    country_code: string;
    registration_type: 1 | 2; // 1 for phone, 2 for email
};

type SignUpResponse = {
    isSuccess: boolean;
    data: {
        username: string;
        otp: number;
        otpId: number;
        registration_type: number;
    };
    message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignUpResponse>) {
    if (req.method === 'POST') {
        const signupData: SignUpRequest = req.body;

        try {
            const response = await fetch(API_ENDPOINTS.auth.signup, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            });

            if (!response.ok) {
                res.status(response.status).json({ isSuccess: false, data: { username: '', otp: 0, otpId: 0, registration_type: 0 }, message: 'Signup failed' });
                return;
            }

            const data: SignUpResponse = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error('Signup failed:', error);
            res.status(500).json({ isSuccess: false, data: { username: '', otp: 0, otpId: 0, registration_type: 0 }, message: 'An unexpected error occurred' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
