import { OtpVerifyResponse } from "@/models/authResponse"
import API_ENDPOINTS from "@/config/apiConfig";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface OtpVerifyRequest {
    username: string;
    otpId?: number;
    otp: number;
    registration_type: 1 | 2;
}

async function otpverify(otpVerifyData: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    try {
        const response = await fetchWithDecryption('/api/auth/otpverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(otpVerifyData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OtpVerifyResponse = await response.json();
        return data;
    } catch (error) {
        console.error('OTP verification failed:', error);
        throw error;
    }
}

export { otpverify }
export type { OtpVerifyRequest }