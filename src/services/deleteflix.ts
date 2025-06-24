import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";

interface DeleteFlixRequest {
    postId: String,
}

interface DeleteFlixResponse extends CommonResponse<""> { }

async function deleteFlix(userData: DeleteFlixRequest): Promise<DeleteFlixResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/deleteflix', {
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

        const data: DeleteFlixResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Add Friend failed:', error);
        throw error;
    }
}

export { deleteFlix }
export type { DeleteFlixRequest, DeleteFlixResponse }

