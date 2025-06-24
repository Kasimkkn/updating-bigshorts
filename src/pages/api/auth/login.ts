import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

type LoginRequest = {
  mobileNo: string;
  isMobile: number;
  device_id: string;
  fcm_token: string;
  password: string;
  login_type: number;
};

type LoginResponse = {
  isSuccess: boolean;
  data: {
    token: string;
  };
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse>) {
  if (req.method === 'POST') {
    const loginData: LoginRequest = req.body;

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        res.status(response.status).json({ isSuccess: false, data: { token: '' }, message: 'Login failed' });
        return;
      }

      const data: LoginResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({ isSuccess: false, data: { token: '' }, message: 'An unexpected error occurred' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
