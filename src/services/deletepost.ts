import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface DeletePostRequest {
    postId: number,
    isPost: number
}

interface DeletePostResponse extends CommonResponse<""> { }

async function deletePost(userData: DeletePostRequest): Promise<DeletePostResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/deletepost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(encryptedData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: DeletePostResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Add Friend failed:', error);
        throw error;
    }
}

export { deletePost }
export type { DeletePostRequest, DeletePostResponse }

