import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";

interface ClearWatchHistoryResponse extends CommonResponse<{ success: boolean }> {}

async function clearWatchHistory(): Promise<ClearWatchHistoryResponse> {
  return new Promise<ClearWatchHistoryResponse>((resolve, reject) => {
    
    // if (!token) {
    //   console.error('Token not found. Please log in again.');
    //   return reject(new Error('Authentication token is missing'));
    // }
    
    try {
      const clearHistory = async () => {
        let token = await getAuthToken();
        const response = await fetchWithDecryption(`/api/clearwatchhistory`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.error('HTTP Error:', response.status);
          return reject(new Error(`HTTP error! status: ${response.status}`));
        }
        
        const data: ClearWatchHistoryResponse = await response.json();
        return resolve(data);
      };
      
      clearHistory();
    } catch (error) {
      console.error('Error clearing watch history:', error);
      return reject(error);
    }
  });
}

export { clearWatchHistory };
export type { ClearWatchHistoryResponse };