import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface DeletePlaylistRequest {
  playlistId: number;
}

interface DeletePlaylistResponse extends CommonResponse<null> {}

async function deletePlaylist(request: DeletePlaylistRequest): Promise<DeletePlaylistResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(request);
    const token = await getAuthToken();
    const response = await fetch('/api/deleteplaylist', {
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

    const data: DeletePlaylistResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
}

export { deletePlaylist }
export type { DeletePlaylistRequest, DeletePlaylistResponse }