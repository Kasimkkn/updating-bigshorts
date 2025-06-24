import API_ENDPOINTS from '@/config/apiConfig'
import { FlixCommentPinReportDeleteRequest, FlixCommentPinReportDeleteResponse } from '@/services/flixcommentpinreportdelete';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<FlixCommentPinReportDeleteResponse>) {
    if (req.method === 'POST') {
        const commentData: FlixCommentPinReportDeleteRequest = req.body;

        try {

            const response = await fetch(API_ENDPOINTS.flix.comments.pinReportDelete, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },

                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: FlixCommentPinReportDeleteResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Error pinning/reporting/deleting comment:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: ""
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}