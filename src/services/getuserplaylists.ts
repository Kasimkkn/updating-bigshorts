import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface UserPlaylist {
    id: number;
    playlist_name: string;
    coverfile: string;
    userid: number;
    description: string;
    scheduledAt: string; // ISO date string
    episodeCount: number;
}


interface GetUserPlaylistsResponse extends CommonResponse<UserPlaylist[]> {}

interface GetUserPlaylistsRequest {
    userId: number;
}

async function getUserPlaylists(userData: GetUserPlaylistsRequest): Promise<GetUserPlaylistsResponse> {
    try { 
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetch('/api/getuserplaylists', {
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

        const data: GetUserPlaylistsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user playlist:', error);
        throw error;
    }
}

export { getUserPlaylists }
export type { GetUserPlaylistsRequest, GetUserPlaylistsResponse, UserPlaylist}