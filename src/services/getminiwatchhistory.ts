import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

export interface WatchHistoryItem {
  flix_id: number;
  watched_position: number;
  watch_percentage: string;
  last_watched: string;
  is_completed: number;
  title: string;
  description: string;
  coverFile: string;
  nsfw: number;
  userFullName: string;
  userName: string;
}

export interface WatchHistoryPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface WatchHistoryData {
  history: WatchHistoryItem[];
  pagination: WatchHistoryPagination;
}

interface MiniWatchHistoryResponse extends CommonResponse<WatchHistoryData> { }

async function fetchMiniWatchHistory(): Promise<MiniWatchHistoryResponse> {
  try {
    let token = await getAuthToken()
    const response = await fetchWithDecryption('/api/getminiwatchhistory', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: MiniWatchHistoryResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Mini Watch History:', error);
    throw error;
  }
}

export { fetchMiniWatchHistory }
export type { MiniWatchHistoryResponse }