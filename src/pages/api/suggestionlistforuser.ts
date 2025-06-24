import API_ENDPOINTS from '@/config/apiConfig'
import { SuggestionListForUserRequest, SuggestionListForUserResponse } from '@/services/suggestionlistforuser';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuggestionListForUserResponse>) {
    if (req.method === 'POST') {
        const userData: SuggestionListForUserRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.userProfile.getSuggestions, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SuggestionListForUserResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Mute story failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    userFullName: "",
                    isRequested: 0,
                    isVerified: 0,
                    totalFollowers: "",
                    userId: 0,
                    userName: "",
                    userProfileImage: ""
                }
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}