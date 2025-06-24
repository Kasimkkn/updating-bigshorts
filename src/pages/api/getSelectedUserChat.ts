// pages/api/app/getselecteduserinchatlist.ts
import API_ENDPOINTS from '@/config/apiConfig';
import { MessageUserListData } from '@/types/messageTypes';
import type { NextApiRequest, NextApiResponse } from 'next';

interface SelectedUserResponse {
    data: MessageUserListData[];
    isSuccess: boolean;
    message: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SelectedUserResponse>
) {
    if (req.method === 'POST') {
        try {
            const { chatUserId } = req.body;
            const authToken = req.headers.authorization;

            const response = await fetch(API_ENDPOINTS.chat.getSelectedUserInChatList, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken || '',
                },
                body: JSON.stringify({ chatUserId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SelectedUserResponse = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error('Get selected user in chat list failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: 'An unexpected error occurred',
                data: [] // Empty array for the error case
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}