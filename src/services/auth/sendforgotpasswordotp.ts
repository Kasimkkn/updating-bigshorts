import API_ENDPOINTS from '@/config/apiConfig';
import { ForgotPasswordResponse } from '@/models/authResponse'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';

interface SendForgotPasswordOtpRequest {
    username: string
}

async function sendforgotpasswordotp(sendForgotPasswordOtpRequest: SendForgotPasswordOtpRequest): Promise<ForgotPasswordResponse> {
    try {

        const response = await fetchWithDecryption('/api/auth/sendforgotpasswordotp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendForgotPasswordOtpRequest),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ForgotPasswordResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }

}

// Export the function
export { sendforgotpasswordotp };
export type { SendForgotPasswordOtpRequest };