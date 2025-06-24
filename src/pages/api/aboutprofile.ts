import API_ENDPOINTS from '@/config/apiConfig'
import { AboutProfileRequest, AboutProfileResponse } from '@/services/aboutprofile';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<AboutProfileResponse>) {
    if (req.method === 'POST') {
        const userData: AboutProfileRequest = req.body;
        
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
              return res.status(401).json({ 
                isSuccess: false, 
                message: 'No authentication token provided',
                data: {
                    username:'',
                    profileimage: '',
                    name: '',
                    isverified: false,
                    createdAt: '',
                    gender: '',
                    pronouns:null   
                }
              });
            }
        
            const token = authHeader.split(' ')[1]; // Extract token
            const response = await fetch(API_ENDPOINTS.userProfile.getAboutProfile, {
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

            const data: AboutProfileResponse = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error('Account overview fetch failed:', error);
            res.status(500).json({
                isSuccess: false,
                message: 'An unexpected error occurred',
                data: {
                    username:'',
                    profileimage: '',
                    name: '',
                    isverified: false,
                    createdAt: '',
                    gender: '',
                    pronouns:null
                }
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}