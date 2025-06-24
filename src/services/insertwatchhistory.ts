import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface WatchHistoryResponse extends CommonResponse<string> {}

interface WatchHistoryRequest {
  flixId: number,
  watchedPosition: number,
  watchPercentage: number
}

async function insertWatchHistory(userData: WatchHistoryRequest): Promise<WatchHistoryResponse> {
  try {
    
    let token = await getAuthToken()
    const requestBody = {
      flix_id: userData.flixId,
      watched_position: userData.watchedPosition,
      watch_percentage: userData.watchPercentage
    }
    const encryptedData = await EncryptionService.encryptRequest(requestBody);
    const response = await fetchWithDecryption('/api/insertwatchhistory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(encryptedData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: WatchHistoryResponse = await response.json();
    
    // Save to localStorage for offline access
    if (data.isSuccess) {
      try {
        const watchData = {
          flixId: userData.flixId,
          watchedPosition: userData.watchedPosition,
          watchedPercentage: userData.watchPercentage.toString(),
          lastWatchedIso: new Date().toISOString(),
          isCompleted: userData.watchPercentage >= 95,
        };
        const storageKey = `watch_history_${userData.flixId}`;
        localStorage.setItem(storageKey, JSON.stringify(watchData));
      } catch (storageError) {
        console.error('Error storing watch history in localStorage:', storageError);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error inserting watch history:', error);
    throw error;
  }
}

export { insertWatchHistory }
export type { WatchHistoryRequest, WatchHistoryResponse }