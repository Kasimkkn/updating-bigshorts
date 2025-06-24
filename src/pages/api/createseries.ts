import API_ENDPOINTS from '@/config/apiConfig'
import { CreateSeriesResponse } from '@/services/createseries';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<CreateSeriesResponse>) {
    if (req.method === 'POST') {
        const seriesData = req.body;

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
              return res.status(401).json({
                isSuccess: false,
                message: 'No authentication token provided',
                data: "" // Add empty data to match the type
              });
            }
            const token = authHeader.split(' ')[1];
            const response = await fetch(API_ENDPOINTS.flix.series.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,

                },
                body: JSON.stringify(seriesData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CreateSeriesResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Create series failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}