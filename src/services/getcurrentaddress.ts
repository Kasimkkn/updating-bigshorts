import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface GetCurrentAddressRequest {
    latitude: string;
    longitude: string;
}

interface GetCurrentAddressResponse {
    status: string;
    data: {
        address: string;
    };
}

const dummyResponse = {
    status: 'success',
    data: {
        address: 'San Francisco, CA 94103, USA',
    },
}

async function getCurrentAddress(userData: GetCurrentAddressRequest): Promise<GetCurrentAddressResponse> {
    // try {
    //     let token = getAuthToken()
    //     const response = await fetch('/api/app/getcurrentaddress', {
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

    //     const data: GetCurrentAddressResponse = await response.json();
    //     return data;
    // } catch (error) {
    //     console.error('Error fetching current address:', error);
    //     throw error;
    // }


    //simulating api response using setTimeout
    try {
        // const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken();

        const data: GetCurrentAddressResponse = await new Promise((resolve) => {
        setTimeout(() => {
            resolve(dummyResponse);
        }, 1000); 
        });

        return data;
    } catch (error) {
        console.error('Error fetching current address:', error);
        throw error;
    }
}

export { getCurrentAddress };
export type { GetCurrentAddressRequest, GetCurrentAddressResponse };

  