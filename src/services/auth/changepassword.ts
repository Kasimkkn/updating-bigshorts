import API_ENDPOINTS from '@/config/apiConfig';
import { ChangePasswordResponse } from '@/models/authResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';

interface ChangePasswordRequest {
    username: string
    userId: number,
    otpId: number,
    new_password: string,
    confirm_password: string
}

async function changePassword(ChangePasswordRequest: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {

        const response = await fetchWithDecryption('/api/auth/changepassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ChangePasswordRequest),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ChangePasswordResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }

}


// Export the function
export { changePassword };
export type { ChangePasswordRequest };