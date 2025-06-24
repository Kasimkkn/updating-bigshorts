import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import EncryptionService from "../encryptionService";
import API_ENDPOINTS from "@/config/apiConfig";
import { getAuthToken } from "@/utils/getAuthtoken";

interface VerifyContactChangeOtpRequest {
    otpId: number;
    username: string;
    otp: string;
    country_code?: string;
}

interface VerifyContactChangeOtpResponse {
    isSuccess: boolean;
    message: string;
}

async function verifyContactChangeOtp(verifyContactChangeOtpData: VerifyContactChangeOtpRequest): Promise<VerifyContactChangeOtpResponse> {
    try {
        let token = await getAuthToken()
        const response = await fetch(API_ENDPOINTS.auth.contactChangeOtpVerify, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(verifyContactChangeOtpData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: VerifyContactChangeOtpResponse = await response.json();
        return data;
    } catch (error) {
        console.error('OTP verification failed for contact update:', error);
        throw error;
    }
}

export { verifyContactChangeOtp }
export type { VerifyContactChangeOtpRequest, VerifyContactChangeOtpResponse };