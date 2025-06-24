import { LoginResponse } from '@/models/authResponse';
import API_ENDPOINTS from '@/config/apiConfig';
import { fetchWithDecryption } from '@/utils/fetchInterceptor';

interface LoginRequest {
  mobileNo: string;
  isMobile: number,
  device_id: string,
  fcm_token: string,
  password: string,
  login_type: number,
}

async function login(loginData: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetchWithDecryption('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export { login };
export type { LoginRequest }