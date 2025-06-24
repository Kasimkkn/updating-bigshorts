import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface EditSeasonResponse {
  isSuccess: boolean;
  message: string;
  data?: {
    season: any;
    episodes: any[];
  };
}

export interface EditSeasonData {
  season_id: number;
  series_id: number;
  season_title?: string;
  season_description?: string;
  season_poster_image?: string;
  flix_ids?: number[];
}


async function editSeason(
  seasonData: EditSeasonData
): Promise<EditSeasonResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(seasonData);
    const token = await getAuthToken();
    const response = await fetch('/api/editseason', {
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

    const data: EditSeasonResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error during season update:', error);
    throw error;
  }
}

export { editSeason };
export type { EditSeasonResponse };