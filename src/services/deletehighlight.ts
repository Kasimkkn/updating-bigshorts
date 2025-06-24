import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import EncryptionService from "./encryptionService";

export interface DeleteHighlightRequest {
    highlightId: number;
}

export interface DeleteHighlightResponse extends CommonResponse<""> { }

interface ApiResponse {
    isSuccess: boolean;
    message?: string;
    data?: any;
}

export async function deleteHighlight(userData: DeleteHighlightRequest): Promise<DeleteHighlightResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken();
        const response = await fetchWithDecryption('/api/deletehighlight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(encryptedData),
        });

        // Cast the response to our expected type
        const apiResponse = response as unknown as ApiResponse;

        return {
            isSuccess: apiResponse.isSuccess,
            message: apiResponse.message || 'Highlight deleted successfully',
            data: apiResponse.data || ""
        };
    } catch (error) {
        console.error('Error deleting highlight:', error);
        return {
            isSuccess: false,
            message: error instanceof Error ? error.message : 'Failed to delete highlight',
            data: ""
        };
    }
}