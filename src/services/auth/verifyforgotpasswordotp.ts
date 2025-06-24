import { VerifyOtpForgotResponse } from '@/models/authResponse'
import API_ENDPOINTS from '@/config/apiConfig'
import { fetchWithDecryption } from '@/utils/fetchInterceptor';

interface VerifyForgotPasswordOtpRequest {
    username: string,
    userId?: number,
    otp: number,
    otpId?: number
}

async function verifyforgotpasswordotp(otpVerifyData: VerifyForgotPasswordOtpRequest): Promise<VerifyOtpForgotResponse> {
    try {
        const response = await fetchWithDecryption('/api/auth/verifyforgotpasswordotp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(otpVerifyData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: VerifyOtpForgotResponse = await response.json();
        return data;
    } catch (error) {
        console.error('OTP verification failed:', error);
        throw error;
    }
}

export { verifyforgotpasswordotp }
export type { VerifyForgotPasswordOtpRequest }
