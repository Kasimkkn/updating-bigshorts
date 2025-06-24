import { getAuthToken } from "@/utils/getAuthtoken";
import { CommonResponse } from "@/models/commonResponse";

const giphyApiKey = process.env.NEXT_PUBLIC_GIPHY_KEY
async function getSearchedStickers(search: string, limit:number, offset:number): Promise<any> {
  try {
    const response = await fetch(`https://api.giphy.com/v1/stickers/search?api_key=${giphyApiKey}&q=${search}&limit=${limit}&offset=${offset}&rating=g&lang=en&bundle=messaging_non_clips`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch stickers: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stickers:', error);
    throw error;
  }
}
export { getSearchedStickers };