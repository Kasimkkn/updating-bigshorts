import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type GetUserNameSuggestionRequest = {
    userName: string;
}


type GetUserNameSuggestionResponse = {
    isSuccess: boolean;
    message: string;
    data?: [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetUserNameSuggestionResponse>) {
    if (req.method === 'POST') {
        const getUserData: GetUserNameSuggestionRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.auth.usernameSuggestion, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(getUserData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: GetUserNameSuggestionResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('User name suggestion failed:', error);
            res.status(500).json({ isSuccess: false, message: 'An unexpected error occurred' });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}