import { CheckUsernameExistResponse } from '@/models/authResponse';
import API_ENDPOINTS from '@/config/apiConfig';
import { fetchWithDecryption } from '@/utils/fetchInterceptor';

interface CheckUsernameExistRequest {
    userName: string
}

async function checkusernameexist(usernameData: CheckUsernameExistRequest): Promise<CheckUsernameExistResponse> {
    try {
        const response = await fetchWithDecryption('/api/auth/checkusernameexists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usernameData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CheckUsernameExistResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Check username exist failed:', error);
        throw error;
    }
}

export { checkusernameexist }
export type { CheckUsernameExistRequest }