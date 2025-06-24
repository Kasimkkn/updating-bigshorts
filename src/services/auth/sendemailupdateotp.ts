import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import EncryptionService from '../encryptionService';
import API_ENDPOINTS from '@/config/apiConfig';
import { getAuthToken } from '@/utils/getAuthtoken';

interface SendEmailUpdateOtpRequest {
    newEmail: string
}

interface SendEmailUpdateOtpResponse {
    isSuccess: boolean;
    message: string;
    data:{
        username: string;
        otpId: number;
    }
}

async function sendEmailUpdateOtp(newData: SendEmailUpdateOtpRequest): Promise<SendEmailUpdateOtpResponse> {
    try {
        let token = await getAuthToken()
        const response = await fetch(API_ENDPOINTS.auth.updateEmail, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SendEmailUpdateOtpResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Email Update failed:", error);
        throw error;
    }

}

// Export the function
export { sendEmailUpdateOtp };
export type { SendEmailUpdateOtpRequest, SendEmailUpdateOtpResponse };