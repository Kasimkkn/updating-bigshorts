import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface CreateFlixResponse {
    isSuccess: boolean;
    message: string;
    data: string;
}

async function createFlixForS3(userData: any): Promise<CreateFlixResponse> {
    const controller = new AbortController();
    const TIMEOUT = 15 * 60 * 1000; // 10 minutes
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/createflixnewfors3', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Timeout-Request': TIMEOUT.toString()
            },
            body: JSON.stringify(encryptedData),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CreateFlixResponse = await response.json();
        return data;

    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error during Flix submission:', error);
        throw error;
    }
}

export { createFlixForS3 };
export type { CreateFlixResponse };