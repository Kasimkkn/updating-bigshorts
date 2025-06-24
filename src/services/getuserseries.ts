import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import { GetUserPlaylistsRequest } from '@/services/getuserplaylists';
import EncryptionService from "./encryptionService";

interface Season {
    id: number;
    name: string;
    coverfile: string;
}

interface Series {
    id: number;
    series_name: string;
    coverfile: string;
    description: string;
    scheduledAt: string | null; // can be null or an ISO date string
    seasons: Season[];
}

interface SeriesData{
    series: Series[];
}


interface GetUserSeriesResponse extends CommonResponse<SeriesData> {}

async function getUserSeries(userData: GetUserPlaylistsRequest): Promise<GetUserSeriesResponse> {
    try { 
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetch('/api/getuserseries', {
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

        const data: GetUserSeriesResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user series:', error);
        throw error;
    }
}

export { getUserSeries }
export type {GetUserSeriesResponse, Series}