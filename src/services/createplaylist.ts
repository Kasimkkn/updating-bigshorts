import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface CreatePlaylistResponse {
  isSuccess: boolean;
  message: string;
  data: string;
}

export interface CreatePlaylistData {
  isCreation: boolean;
  playlist_name: string;
  coverfile: string;
  description: string;
  flix_ids: number[];
  playlist_id?:number;
  playlist_scheduledAt?: string;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
async function createPlaylistWithEpisodes(
  playlistData: CreatePlaylistData
): Promise<CreatePlaylistResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(playlistData);
    let token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/app/createplaylistwithepisodes`, {
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

    const data: CreatePlaylistResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error during playlist creation:', error);
    throw error;
  }
}

export { createPlaylistWithEpisodes };
export type { CreatePlaylistResponse };