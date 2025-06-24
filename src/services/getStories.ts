import { StoryResponse } from "@/models/storyResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

let debounceTimeout: NodeJS.Timeout | null = null;

async function getStoriesList(): Promise<StoryResponse> {
    return new Promise<StoryResponse>((resolve, reject) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        debounceTimeout = setTimeout(async () => {
            const encryptedData = await EncryptionService.encryptRequest({});
            let token = await getAuthToken()

            if (!token) {
                console.error('Token not found. Please log in again.');
                return reject(new Error('Authentication token is missing'));
            }

            try {

                const response = await fetchWithDecryption('/api/getStories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error('HTTP Error:', response.status);
                    return reject(new Error(`HTTP error! status: ${response.status}`));
                }

                const data: StoryResponse = await response.json();

                return resolve(data);
            } catch (error) {
                console.error('Error fetching Stories failed:', error);
                return reject(error);
            }
        }, 300);
    });
}

export { getStoriesList }