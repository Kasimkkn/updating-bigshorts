import { GetUsernameSuggestionResponse } from "@/models/authResponse";
import API_ENDPOINTS from "@/config/apiConfig";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface GetUserNameSuggestionRequest {
    userName: string;
}

async function getusernamesuggestion(usernameData: GetUserNameSuggestionRequest): Promise<GetUsernameSuggestionResponse> {
    try {
        const response = await fetchWithDecryption('/api/auth/getusernamesuggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usernameData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GetUsernameSuggestionResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to get username :", error);
        throw error;
    }
}

export { getusernamesuggestion }
export type { GetUserNameSuggestionRequest }