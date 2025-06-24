import { getAuthToken } from "@/utils/getAuthtoken";
import { CommonResponse } from "@/models/commonResponse";
import { PostlistItem } from "@/models/postlistResponse"; // Assuming this type matches the response data
import EncryptionService from "./encryptionService";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface GetPlaylistVideosRequest {
  playlistId: number;
}

interface GetPlaylistVideosResponse extends CommonResponse<PostlistItem[]> { }

async function getPlaylistVideos(postData: GetPlaylistVideosRequest): Promise<GetPlaylistVideosResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(postData);
    let token = await getAuthToken();
    const response = await fetchWithDecryption('/api/getplaylistflixdetails', {
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

    const data: GetPlaylistVideosResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    throw error;
  }
}
export { getPlaylistVideos };
export type { GetPlaylistVideosRequest, GetPlaylistVideosResponse };