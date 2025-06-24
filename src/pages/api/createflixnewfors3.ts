import API_ENDPOINTS from '@/config/apiConfig'
import { CreateFlixResponse } from '@/services/createflixnewfors3';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<CreateFlixResponse>) {
    if (req.method === 'POST') {
        const flixData = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.flix.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(flixData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CreateFlixResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Create Flix Failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}