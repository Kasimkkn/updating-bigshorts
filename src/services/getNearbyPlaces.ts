import { getAuthToken } from '@/utils/getAuthtoken';

interface GetNearbyPlacesRequest {
    latitude: string;
    longitude: string;
}

interface NearbyPlace {
    name: string;
    address: string;
    rating: string;
    latitude: number;
    longitude: number;
    distance: number;
}
  
interface GetNearbyPlacesResponse {
    status: string;
    data: NearbyPlace[];
}
  

const dummyResponse = {
    "status": "success",
    "data": [
      {
        "name": "Starbucks",
        "address": "123 Main Street",
        "rating": "4.3",
        "latitude": 37.7854,
        "longitude": -122.4064,
        "distance": 0.4
      },
      {
        "name": "Golden Gate Park",
        "address": "501 Stanyan St",
        "rating": "4.8",
        "latitude": 37.7694,
        "longitude": -122.4862,
        "distance": 0.7
      },
      {
        "name": "Blue Bottle Coffee",
        "address": "315 Linden St",
        "rating": "4.5",
        "latitude": 37.7767,
        "longitude": -122.4233,
        "distance": 0.9
      },
      {
        "name": "The Cheesecake Factory",
        "address": "8 Market Street",
        "rating": "4.1",
        "latitude": 37.7935,
        "longitude": -122.3969,
        "distance": 1.2
      },
      {
        "name": "Dolores Park",
        "address": "Dolores St & 19th St",
        "rating": "4.7",
        "latitude": 37.7596,
        "longitude": -122.4269,
        "distance": 1.4
      }
    ]
  }

async function getNearbyPlaces(userData: GetNearbyPlacesRequest): Promise<GetNearbyPlacesResponse> {
    // try {
    //     let token = getAuthToken()
    //     const response = await fetch('/api/app/getnearbyplaces', {
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
    //     console.error('Error fetching nearby places:', error);
    //     throw error;
    // }


    //simulating api response using setTimeout
    try {
        let token = getAuthToken();

        const data: GetNearbyPlacesResponse = await new Promise((resolve) => {
        setTimeout(() => {
            resolve(dummyResponse);
        }, 1000); 
        });

        return data;
    } catch (error) {
        console.error('Error fetching nearby places:', error);
        throw error;
    }
}

export { getNearbyPlaces };
export type { GetNearbyPlacesRequest, GetNearbyPlacesResponse, NearbyPlace };