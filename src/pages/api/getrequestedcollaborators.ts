import API_ENDPOINTS from '@/config/apiConfig'
import { GetRequestedCollaboratorsRequest, GetRequestedCollaboratorsResponse } from '@/services/getrequestedcollaborators';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetRequestedCollaboratorsResponse>) {
    if (req.method === 'POST') {
        const userData: GetRequestedCollaboratorsRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.post.requestedCollaborators, {
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

            const data: GetRequestedCollaboratorsResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('getRequestedCollaborators failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: "",
                data: [],
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}