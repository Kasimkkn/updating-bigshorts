
import { getAuthToken } from "@/utils/getAuthtoken";
import { CommonResponse } from "@/models/commonResponse";
import EncryptionService from "./encryptionService";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface SeriesListData {
    series: Series[];
}

interface Series {
    id: number;
    series_name: string;
    coverfile: string;
    description: string;
    scheduledAt: string | null;
    seasons: Season[];
  }
  
interface Season {
    id: number;
    name: string;
}

interface GetSeriesListRequest {
    page: number;
    limit: number;
}

interface GetSeriesListResponse extends CommonResponse<SeriesListData> { }

async function getSeriesList(postData: GetSeriesListRequest): Promise<GetSeriesListResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(postData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/getserieslist', {
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

        const data: GetSeriesListResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching series list:', error);
        throw error;
    }
}

export { getSeriesList };
export type { GetSeriesListRequest, GetSeriesListResponse, Series, Season };