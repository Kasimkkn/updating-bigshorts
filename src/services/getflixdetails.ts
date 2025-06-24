import { PostlistResponse } from "@/models/postlistResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";


async function getFlixDetails(postId: number,userId: number): Promise<PostlistResponse> {
try {
        // const encryptedData = await EncryptionService.encryptRequest({ postId, userId });
        let token = await getAuthToken()
        const response = await fetchWithDecryption(`/api/getflixdetails`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'PostId': `${postId}`,  // Check capitalization here
        'UserId': `${userId}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PostlistResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching flix list:', error);
        throw error;
    }
}

export { getFlixDetails };