import API_ENDPOINTS from '@/config/apiConfig'
import { ArchivesReponse } from '@/services/getarchives';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ArchivesReponse>) {
    if (req.method === 'POST') {
        try {

            const response = await fetch(API_ENDPOINTS.settings.getArchives, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ArchivesReponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Muted Users failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: []
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}