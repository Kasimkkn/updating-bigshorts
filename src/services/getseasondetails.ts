import { getAuthToken } from "@/utils/getAuthtoken";
import { CommonResponse } from "@/models/commonResponse";
import EncryptionService from "./encryptionService";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface SeasonData {
    season: Season;
    episodes: Episode[];
}
interface Season {
    id: number;
    number: number;
    title: string;
    description: string;
    poster_image: string;
    release_year: number | null;
    scheduled_at: string | null;
}
  
interface Episode {
    id: number;
    title: string;
    description: string;
    flixid: number;
    thumbnail: string;
    duration: string | null;
    air_date: string | null;
}

interface GetSeasonDetailsRequest {
    series_id: number;
    season_id: number;
}

interface GetSeasonDetailsResponse extends CommonResponse<SeasonData> { }

async function getSeasonDetails(postData: GetSeasonDetailsRequest): Promise<GetSeasonDetailsResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(postData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getseasondetails', {
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

        const data: GetSeasonDetailsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching series list:', error);
        throw error;
    }
}

export { getSeasonDetails };
export type { GetSeasonDetailsRequest, GetSeasonDetailsResponse, SeasonData };