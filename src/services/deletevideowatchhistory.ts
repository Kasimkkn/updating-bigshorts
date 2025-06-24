import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";

interface DeleteVideoHistoryResponse extends CommonResponse<{ success: boolean }> {}

async function deleteVideoHistory(flixId: number): Promise<DeleteVideoHistoryResponse> {
  return new Promise<DeleteVideoHistoryResponse>((resolve, reject) => {

    
    
    try {
      const deleteVideo = async () => {
        let token = await getAuthToken();
        const response = await fetchWithDecryption(`/api/deletevideowatchhistory`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'FlixId': `${flixId}`,

          },
        });
        
        if (!response.ok) {
          console.error('HTTP Error:', response.status);
          return reject(new Error(`HTTP error! status: ${response.status}`));
        }
        
        const data: DeleteVideoHistoryResponse = await response.json();
        return resolve(data);
      };
      
      deleteVideo();
    } catch (error) {
      console.error('Error deleting video from watch history:', error);
      return reject(error);
    }
  });
}

export { deleteVideoHistory };
export type { DeleteVideoHistoryResponse };