import type { NextApiRequest, NextApiResponse } from 'next';
import API_ENDPOINTS from '@/config/apiConfig';
import { CommonResponse } from "@/models/commonResponse";

// Season interface
interface Season {
  id: number;
  name: string;
  coverfile: string;
}

// Series interface
interface Series {
  id: number;
  series_name: string;
  coverfile: string;
  description: string;
  scheduledAt: string | null;
  seasons: Season[];
}

// Request interface
interface GetUserPlaylistsRequest {
  userId: string;
}

// Data interface
interface SeriesData {
  series: Series[];
}

// Response type
type GetUserSeriesResponse = CommonResponse<SeriesData>;

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<GetUserSeriesResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      isSuccess: false,
      message: 'Method Not Allowed',
      data: { series: [] }
    });
  }

  try {
    // Extract request body
    const userData: GetUserPlaylistsRequest = req.body;

    // Forward request to external API
    const response = await fetch(API_ENDPOINTS.flix.series.getUserSeries, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${req.headers.authorization}`,
      },
      body: JSON.stringify(userData),
    });

    // Check if the response is not ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response
    const data: GetUserSeriesResponse = await response.json();

    // Return the response
    res.status(200).json(data);
  } catch (error) {
    // Log the error
    console.error('Error fetching user series:', error);

    // Return error response
    res.status(500).json({
      isSuccess: false,
      message: 'An unexpected error occurred',
      data: { series: [] }
    });
  }
}