import API_ENDPOINTS from '@/config/apiConfig'
import { NotificationResponse } from '@/models/notficationResponse';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<NotificationResponse>) {
    if (req.method === 'POST') {
        try {

            const response = await fetch(API_ENDPOINTS.shared.notifications.push, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: NotificationResponse = await response.json();
            res.status(200).json(data);

        } catch (error) {
            console.error('Fan list failed:', error);
            res.status(500).json({
                isSuccess: false, message: 'An unexpected error occurred', data: {
                    userId: 0,
                    userName: "",
                    coverFileName: "",
                    isForInteractiveImage: "0",
                    isForInteractiveVideo: "0",
                    notificationType: "",
                    notificationDetail: "",
                    isFriend: 0,
                    isPrivateAccount: 0,
                    isRequested: 0,
                    notificationTime: "",
                    postId: 0,
                    postTitle: "",
                    userImage: "",
                    isAccepted: 0

                }
            });
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}