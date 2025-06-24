// server-side API route
import API_ENDPOINTS from '@/config/apiConfig';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthToken } from "@/utils/getAuthtoken";
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
type PresignedUrl = {
  fileName: string;
  url: string;
};

type PresignedUrlResponse = {
  urls: PresignedUrl[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<PresignedUrlResponse | { isSuccess: boolean; message: string }>) {
  if (req.method === 'POST') {
    const { files, contentType } = req.body;
    
    // Log incoming request for debugging
try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ 
          isSuccess: false, 
          message: 'No authentication token provided' 
        });
      }
  
      const token = authHeader.split(' ')[1]; // Extract token
  
      const requestData = {
        files: files.map((file: { fileName: string }) => ({
          fileName: file.fileName,
          contentType: contentType,
        })),
      };
      
      // Log outgoing request to backend
const cacheBuster = `cacheBust=${Date.now()}`;
      const response = await fetch(`${API_ENDPOINTS.upload.getPresignedUrl}?${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        console.error(`Backend returned error status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PresignedUrlResponse = await response.json();
      
      // Log response from backend
res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching presigned URLs:', error);
      res.status(500).json({ isSuccess: false, message: 'Failed to fetch presigned URLs' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}