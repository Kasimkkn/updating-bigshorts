import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type RegistrationRequest = {
    username: string;
    otpId: number;
    password: string;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    birthdate: string;
    userprofilename: string;
    device_id: string;
    fcm_token: string;
    registration_type: 0;
}

type RegistrationResponse = {
    isSuccess: boolean;
    message: string;
    data?: {
        token: string;
        userId: number;
        fullName: string;
        userName: string;
        mobileNo: string;
        pronouns: string;
        email: string;
        isallownotification: number;
        isallowtagging: number;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<RegistrationResponse>) {
    if (req.method === 'POST') {
        const registrationData: RegistrationRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.registration, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: RegistrationResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Registration failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred' });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}