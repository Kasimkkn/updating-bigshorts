import { SignupResponse } from "@/models/authResponse";
import API_ENDPOINTS from "@/config/apiConfig";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

// Define the request interface
interface SignupRequest {
  username: string;
  country_code?: string;
  registration_type: 1 | 2; // 1 for phone, 2 for email
}

// Create the signup function
async function signup(signupData: SignupRequest): Promise<SignupResponse> {
  try {
    const response = await fetchWithDecryption('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any other necessary headers here
      },
      body: JSON.stringify(signupData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SignupResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Signup failed:", error);
    throw error;
  }
}

// Export the function
export { signup };
export type { SignupRequest };