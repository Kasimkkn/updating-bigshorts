import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface CommentPinReportDeleteRequest {
    postId: number,
    commentId: number,
    replyId?:number,
    commentType: number,
    report?: string,
    reportType?: string,
}

interface CommentPinReportDeleteResponse extends CommonResponse<string> { }

async function commentPinReportDelete(userData: CommentPinReportDeleteRequest): Promise<CommentPinReportDeleteResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/commentpinreportdelete', {
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

        const data: CommentPinReportDeleteResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error pinning/reporting/deleting comment: ', error);
        throw error;
    }
}

export { commentPinReportDelete }
export type { CommentPinReportDeleteRequest, CommentPinReportDeleteResponse }