import { SeacrhedResponse } from '@/models/searchResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface DiscoverSearchRequest {
    pageNo: number,
    isUser: number,
    isAudio: number,
    isHashTag: number,
    isAll: number,
    searchValue: string
}

async function getSearched(searchedData: DiscoverSearchRequest): Promise<SeacrhedResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(searchedData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/discoverSearch', {
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

        const data: SeacrhedResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Discover Search failed:', error);
        throw error;
    }
}

export { getSearched };
export type { DiscoverSearchRequest };
