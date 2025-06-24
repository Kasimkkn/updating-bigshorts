import API_ENDPOINTS from '@/config/apiConfig'
import { GetSeriesListRequest, GetSeriesListResponse } from '@/services/getserieslist';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSeriesListResponse>) {
    if (req.method === 'POST') {
        const Userdata: GetSeriesListRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.flix.series.seriesList, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(Userdata),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: GetSeriesListResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Save other post failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: "",
                data: {series: []},
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}