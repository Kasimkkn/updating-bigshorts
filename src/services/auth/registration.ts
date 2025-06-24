import { RegistrationResponse } from "@/models/authResponse";
import API_ENDPOINTS from "@/config/apiConfig";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface RegistrationRequest {
    username: string;
    otpId: number | null;  // ← Changed from 'number' to 'number | null'
    password: string;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    birthdate: string;
    userprofilename: string;
    device_id: string;
    fcm_token: string;
    registration_type: number;  // ← Changed from '0' to 'number' to allow different values
    third_party_password?: string;
}

async function registration(registerData: RegistrationRequest): Promise<RegistrationResponse> {
    try {
        const response = await fetchWithDecryption('/api/auth/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other necessary headers here
            },
            body: JSON.stringify(registerData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: RegistrationResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
}


export { registration }
export type { RegistrationRequest }