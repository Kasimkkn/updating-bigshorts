import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface SavePostReportResponse extends CommonResponse<"">{};

interface SavePostReportRequest{
    postId: number;
    reportType: string;
    comment: string;
    email: string;
    phone: string;
}


async function savePostReport(userData: SavePostReportRequest): Promise<SavePostReportResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/savepostreport', {
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

        const data: SavePostReportResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching save other post:', error);
        throw error;
    }
}

export { savePostReport }
export type { SavePostReportRequest, SavePostReportResponse}