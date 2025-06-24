import API_ENDPOINTS from '@/config/apiConfig'
import { SaveOtherFlixRequest, SaveOtherFlixResponse } from '@/services/saveotherflix';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<SaveOtherFlixResponse>) {
    if (req.method === 'POST') {
        const userData: SaveOtherFlixRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.flix.saveOtherFlix, {
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

            const data: SaveOtherFlixResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Post List failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: "",
                data: "",
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}