import API_ENDPOINTS from '@/config/apiConfig';
import { fetchWithDecryption } from '@/utils/fetchInterceptor';
import { getAuthToken } from '@/utils/getAuthtoken';

interface SendPhoneUpdateOtpRequest {
    mobileNo: string;
    country_code: string;
}

interface SendPhoneUpdateOtpResponse {
    isSuccess: boolean;
    message: string;
    data: {
        username: string;
        otpId: number;
    }
}

async function sendPhoneUpdateOtp(newData: SendPhoneUpdateOtpRequest): Promise<SendPhoneUpdateOtpResponse> {
    try {
        let token = await getAuthToken()
        const response = await fetch(API_ENDPOINTS.auth.updatePhone, {
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

        const data: SendPhoneUpdateOtpResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Phone update failed:", error);
        throw error;
    }

}

// Export the function
export { sendPhoneUpdateOtp };
export type { SendPhoneUpdateOtpRequest, SendPhoneUpdateOtpResponse };