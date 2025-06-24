import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface DeleteSeriesRequest {
  series_id: number;
}

interface DeleteSeriesResponse extends CommonResponse<null> {}

async function deleteSeries(request: DeleteSeriesRequest): Promise<DeleteSeriesResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(request);
    const token = await getAuthToken();
    const response = await fetchWithDecryption('/api/deleteseries', {
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

    const data: DeleteSeriesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting series:', error);
    throw error;
  }
}

export { deleteSeries };
export type { DeleteSeriesRequest, DeleteSeriesResponse };