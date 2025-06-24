import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface DeleteSeasonsRequest {
  seasonIds: number[];
  deleteflix?: boolean;
}

interface DeleteSeasonsResponse extends CommonResponse<null> {}

async function deleteSeasons(request: DeleteSeasonsRequest): Promise<DeleteSeasonsResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(request);
    const token = await getAuthToken();
    const response = await fetch('/api/deleteseasons', {
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

    const data: DeleteSeasonsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting seasons:', error);
    throw error;
  }
}

export { deleteSeasons };
export type { DeleteSeasonsRequest, DeleteSeasonsResponse };