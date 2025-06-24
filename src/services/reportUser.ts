import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface ReportUserResponse extends CommonResponse<"">{};

interface ReportUserRequest{
    reportuserId: number;
    reportType: string;
    comment: string;
    email: string;
    phone: string;
}


async function reportUser(userData: ReportUserRequest): Promise<ReportUserResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/reportUser', {
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

        const data: ReportUserResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Could not report user:', error);
        throw error;
    }
}

export { reportUser }
export type { ReportUserRequest, ReportUserResponse}