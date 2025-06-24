import { getAuthToken } from '@/utils/getAuthtoken';

interface SearchPlacesRequest {
    query: string;
}

interface Place {
    name: string;
    address: string;
    rating: string;
    latitude: number;
    longitude: number;
}
  
interface SearchPlacesResponse {
    status: string;
    data: Place[];
}

const dummyResponse = {
    "status": "success",
    "data": [
      {
        "name": "Blue Bottle Coffee",
        "address": "315 Linden St, San Francisco, CA 94102, United States",
        "rating": "4.5",
        "latitude": 37.7767,
        "longitude": -122.4233
      },
      {
        "name": "Sightglass Coffee",
        "address": "270 7th St, San Francisco, CA 94103, United States",
        "rating": "4.4",
        "latitude": 37.7762,
        "longitude": -122.4081
      },
      {
        "name": "Ritual Coffee Roasters",
        "address": "1026 Valencia St, San Francisco, CA 94110, United States",
        "rating": "4.3",
        "latitude": 37.7565,
        "longitude": -122.4210
      },
      {
        "name": "Philz Coffee",
        "address": "748 Van Ness Ave, San Francisco, CA 94102, United States",
        "rating": "4.6",
        "latitude": 37.7821,
        "longitude": -122.4209
      },
      {
        "name": "Four Barrel Coffee",
        "address": "375 Valencia St, San Francisco, CA 94103, United States",
        "rating": "4.2",
        "latitude": 37.7668,
        "longitude": -122.4217
      }
    ]
  }

async function searchPlaces(userData: SearchPlacesRequest): Promise<SearchPlacesResponse> {
    // try {
    //     let token = getAuthToken()
    //     const response = await fetch('/api/app/searchplacesbytext', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${token}`,
    //         },
    //         body: JSON.stringify(userData),
    //     });

    //     if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //     }

    //     const data: SearchPlacesResponse = await response.json();
    //     return data;
    // } catch (error) {
    //     console.error('Error fetching searched places:', error);
    //     throw error;
    // }


    //simulating api response using setTimeout
    try {
        let token = getAuthToken();

        const data: SearchPlacesResponse = await new Promise((resolve) => {
        setTimeout(() => {
            resolve(dummyResponse);
        }, 1000); 
        });

        return data;
    } catch (error) {
        console.error('Error fetching searched places:', error);
        throw error;
    }
}

export { searchPlaces };
export type { SearchPlacesRequest, SearchPlacesResponse, Place };