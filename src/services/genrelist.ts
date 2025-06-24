
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';
export interface Genre {
    id: number;
    name: string;
  }
  
  // Response Interface
  export interface GenreListResponse {
    isSuccess: boolean;
    message: string;
    data: Genre[];
  }
  
  // Service Function
  async function getGenreList(): Promise<GenreListResponse> {
    try {
      let token = await getAuthToken();
      const response = await fetchWithDecryption('/api/genrelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data: GenreListResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching genre list:', error);
      throw error;
    }
  }
  
  export { getGenreList }