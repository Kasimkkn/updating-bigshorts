import API_ENDPOINTS from '@/config/apiConfig'
import { MusicSavedResponse } from '@/models/savedResponse';
import { MusicSavedRequest } from '@/services/getuserbookmarklist';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<MusicSavedResponse>) {
    if (req.method === 'POST') {
        const userData: MusicSavedRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.saved.audio, {
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

            const data: MusicSavedResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('User AUdio Saved failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    audioId: 0,
                    audioName: "",
                    audioDuration: "",
                    audioCoverImage: "",
                    audioFile: ""
                }
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}
