import { CommonResponse } from '@/models/commonResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface PrivateAccountResponse extends CommonResponse<{}> { }
async function privateAccount(): Promise<PrivateAccountResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest({});
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/privateaccount', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PrivateAccountResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user profile failed:', error);
        throw error;
    }
}

export { privateAccount }
export type { PrivateAccountResponse }