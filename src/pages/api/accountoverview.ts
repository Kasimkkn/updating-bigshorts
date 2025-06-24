import API_ENDPOINTS from '@/config/apiConfig'
import { AccountOverviewRequest, AccountOverviewResponse } from '@/services/accountoverview';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<AccountOverviewResponse>) {
    if (req.method === 'POST') {
        const accountOverviewData: AccountOverviewRequest = req.body;
        
        try {
            const response = await fetch(API_ENDPOINTS.userProfile.accountOverview, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${req.headers.authorization}`,
                },
                body: JSON.stringify({ duration: accountOverviewData.duration }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AccountOverviewResponse = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error('Account overview fetch failed:', error);
            res.status(500).json({
                success: false,
                message: 'An unexpected error occurred',
                data: {
                    userProfileImage: '',
                    userName: '',
                    contentShared: 0,
                    totalPost: 0,
                    totalFlix: 0,
                    totalFollowers: 0,
                    accountsReached: 0,
                    distinctUserInteractions: {
                        postInteractions: {
                            videoLikeUsers: 0,
                            postLikeUsers: 0,
                            postCommentUsers: 0,
                            postSaveUsers: 0,
                            postShareUsers: 0
                        },
                        flixInteractions: {
                            flixLikeUsers: 0,
                            flixCommentUsers: 0,
                            flixSaveUsers: 0,
                            flixShareUsers: 0
                        }
                    },
                    totalEngagement: 0
                }
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}