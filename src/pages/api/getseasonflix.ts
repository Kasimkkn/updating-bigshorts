import API_ENDPOINTS from '@/config/apiConfig'
import { GetSeasonFlixRequest, GetSeasonFlixResponse } from '@/services/getseasonflix';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSeasonFlixResponse>) {
    if (req.method === 'POST') {
        const userData: GetSeasonFlixRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.flix.series.seasonFlix, {
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

            const data: GetSeasonFlixResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('getseasonflixdetails failed:', error);
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