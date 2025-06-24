import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

// Define the response type - you'll need to update this based on the actual response structure
interface LinkOldVideoResponse {
    isSuccess: boolean;
    message: string;
    data: {
      count: number;
      data: Array<{
        id: number; // or string if needed
        title: string;
        coverfilename: string;
      }>;
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
      };
    };
  }
  
  



async function getVideosToLink(): Promise<LinkOldVideoResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest({});
    let token = await getAuthToken();
    const response = await fetchWithDecryption('/api/linkoldsnip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: LinkOldVideoResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching videos to link:', error);
    throw error;
  }
}

export { getVideosToLink };
export type {LinkOldVideoResponse};