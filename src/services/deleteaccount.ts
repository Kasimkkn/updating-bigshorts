import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface DeleteAccountRequest {
    isActive: number,
}

interface DeleteAccountResponse extends CommonResponse<{}> { }

async function deleteAccount(userData: DeleteAccountRequest): Promise<DeleteAccountResponse>{
    try{
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetchWithDecryption('/api/inactiveaccountV1', {
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

        const data: DeleteAccountResponse = await response.json();
        return data;
    }catch (error) {
        console.error('Error deleting account failed', error);
        throw error;
    }
}

export { deleteAccount }
export type { DeleteAccountResponse }