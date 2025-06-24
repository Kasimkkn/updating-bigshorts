import API_ENDPOINTS from '@/config/apiConfig'
import { GetSeasonDetailsRequest, GetSeasonDetailsResponse } from '@/services/getseasondetails';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSeasonDetailsResponse>) {
  if (req.method === 'POST') {
    const postData: GetSeasonDetailsRequest = req.body;
    try {
      const response = await fetch(API_ENDPOINTS.flix.series.getSeasonDetails, {
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

      const data: GetSeasonDetailsResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Get Season Details failed:', error);
      res.status(500).json({
        isSuccess: false, 
        message: 'An unexpected error occurred', 
        data: {
          season: {} as any,
          episodes: []
        }
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}