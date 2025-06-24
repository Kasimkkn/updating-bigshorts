import API_ENDPOINTS from '@/config/apiConfig'
import { AcceptCollaborationInviteRequest, AcceptCollaborationInviteResponse } from '@/services/acceptcollaborationinvite';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<AcceptCollaborationInviteResponse>) {
    if (req.method === 'POST') {
        const userData: AcceptCollaborationInviteRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.post.acceptCollaborativeInvite, {
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

            const data: AcceptCollaborationInviteResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('AcceptCollaborationInvite failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: "",
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}