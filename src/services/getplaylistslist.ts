import { getAuthToken } from "@/utils/getAuthtoken";
import { CommonResponse } from "@/models/commonResponse";
import EncryptionService from "./encryptionService";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";


interface PlaylistsListData {
  playlists: Playlist[];
}

interface Playlist {
  id: number;
  playlist_name: string;
  coverfile: string;
  userid: number;
  description: string;
  scheduledAt: string | null;
  userData: UserData;
}

interface UserData {
  id: number;
  username: string;
  profileImage: string;
  name: string;
}

interface GetPlaylistsListRequest {
  page: number;
  limit: number;
}

interface GetPlaylistsListResponse extends CommonResponse<Playlist[]> { }

async function getPlaylistsList(postData: GetPlaylistsListRequest): Promise<GetPlaylistsListResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(postData);
    let token = await getAuthToken()
    const response = await fetchWithDecryption('/api/getplaylistslist', {
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

    const data: GetPlaylistsListResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching playlists list:', error);
    throw error;
  }
}
export { getPlaylistsList };
export type { GetPlaylistsListRequest, GetPlaylistsListResponse, Playlist, UserData };