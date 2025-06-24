import API_ENDPOINTS from '@/config/apiConfig';
import { ChangeKnownPasswordResponse } from '@/models/authResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';

interface ChangeKnownPasswordRequest {
    current_password: string,
    new_password: string,
    confirm_password: string
}

async function changeKnownPassword(ChangePasswordRequest: ChangeKnownPasswordRequest): Promise<ChangeKnownPasswordResponse> {
    try {
        let token = await getAuthToken();
        const response = await fetchWithDecryption('/api/auth/changeknownpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(ChangePasswordRequest),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ChangeKnownPasswordResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }

}


// Export the function
export { changeKnownPassword };
export type { ChangeKnownPasswordRequest };