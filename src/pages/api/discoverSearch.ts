import API_ENDPOINTS from '@/config/apiConfig'
import { DiscoverSearchRequest } from '@/services/discoverSearch';
import { SeacrhedResponse } from "@/models/searchResponse";
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<SeacrhedResponse>) {
    if (req.method === 'POST') {
        const addFriendData: DiscoverSearchRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.shared.search, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(addFriendData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SeacrhedResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Search failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    data: []
                }
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}