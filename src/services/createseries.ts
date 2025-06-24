import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface CreateSeriesResponse {
  isSuccess: boolean;
  message: string;
  data: string;
}

export interface CreateSeriesData {
  isCreation: boolean;
  series_id?:number;
  series_name: string;
  series_description: string;
  series_coverfile: string;
  season_number?: number;
  season_title: string;
  season_description: string;
  season_poster_image?: string;
  season_release_year?: number;
  flix_ids: number[];
  series_scheduledAt?: string;
  season_scheduledAt?: string;
}

async function createSeriesWithEpisodes(
  seriesData: CreateSeriesData
): Promise<CreateSeriesResponse> {
  try {
    let token = getAuthToken();
    
    // Prepare the request body with all required fields
    const requestBody = {
      isCreation: seriesData.isCreation,
      series_id: seriesData.series_id ? seriesData.series_id : null,
      series_name: seriesData.series_name,
      description: seriesData.series_description,
      coverfile: seriesData.series_coverfile || '',
      season_number: seriesData.season_number || 1,
      season_title: seriesData.season_title,
      season_description: seriesData.season_description,
      season_poster_image: seriesData.season_poster_image || '',
      season_release_year: seriesData.season_release_year || new Date().getFullYear(),
      flix_ids: seriesData.flix_ids,
      series_scheduledAt: seriesData.series_scheduledAt || '0 days 0 hours 5 minutes',
      season_scheduledAt: seriesData.season_scheduledAt || ''
    };
    const encryptedData = await EncryptionService.encryptRequest(requestBody);
    const response = await fetch('/api/createseries', {
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

    const data: CreateSeriesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error during series creation:', error);
    throw error;
  }
}

export { createSeriesWithEpisodes };
export type { CreateSeriesResponse };