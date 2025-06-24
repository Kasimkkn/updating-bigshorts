import { AccountOverviewResponse } from '@/models/accountOverviewResponse'
import { getAuthToken } from '@/utils/getAuthtoken';
import EncryptionService from './encryptionService';

interface AccountOverviewRequest {
    duration: number;
}

async function getAccountOverview(duration: number): Promise<AccountOverviewResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest({duration});
        let token = await getAuthToken();
        const response = await fetch('/api/accountoverview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({duration}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AccountOverviewResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching account overview:', error);
        throw error;
    }
}

export { getAccountOverview }
export type { AccountOverviewRequest,AccountOverviewResponse }