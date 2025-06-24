import API_ENDPOINTS from '@/config/apiConfig'
import { AllUsersResponse } from '@/models/allUsersResponse';
import { ChatUserListRequest } from '@/services/userchatlist';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<AllUsersResponse>) {
  if (req.method === 'POST') {
    const userData: ChatUserListRequest = req.body;
    try {
      const response = await fetch(API_ENDPOINTS.chat.userChatList, {
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

      const data: AllUsersResponse = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching chat user list:', error);
      
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}