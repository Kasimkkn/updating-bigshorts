import API_ENDPOINTS from '@/config/apiConfig'
import { EditSeasonResponse } from '@/services/editseason';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<EditSeasonResponse>) {
    if (req.method === 'POST') {
        const seasonData = req.body;

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    isSuccess: false,
                    message: 'No authentication token provided',
                });
            }
            const token = authHeader.split(' ')[1];
            const response = await fetch(API_ENDPOINTS.flix.series.editSeason, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,

                },
                body: JSON.stringify(seasonData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: EditSeasonResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Edit season failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred',
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}