import API_ENDPOINTS from '@/config/apiConfig'
import { PollByFlixRequest, PollByFlixResponse } from '@/services/getpollbyflix';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<PollByFlixResponse>) {
    if (req.method === 'POST') {
        const postData: PollByFlixRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.flix.polls.get, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: PollByFlixResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Poll By FLix failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}