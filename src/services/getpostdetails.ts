import { PostlistResponse } from "@/models/postlistResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import { getEncryptedItem } from "@/utils/encryptedStorage";

async function getPostDetails(postId: string): Promise<PostlistResponse> {
    try {
        let userId = await getEncryptedItem('userId');
        let token = await getAuthToken()
        
        const response = await fetchWithDecryption(`/api/getpostdetails`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'PostId': `${postId}`,
                'UserId': `${userId}`,
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: PostlistResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching post list:', error);
        throw error;
    }
}

export { getPostDetails };