import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";
import { request } from "http";

interface SearchResultItem {
    coverFile: string;
    id: number;
    title: string;
    type: string;
    userProfileImage: string;
    userid: number;
    username: string;
    userFullName?: string; // Make it optional since API might not provide it
}

interface FlixSearchRequest {
    query: string;
    page?: number;
    limit?: number;
    searchUsers?: boolean;
}

interface FlixSearchResponse extends CommonResponse<SearchResultItem[]> { }

async function flixSearch(userData: FlixSearchRequest): Promise<FlixSearchResponse> {
    if (!userData || !userData.query) {
        console.error('Invalid search request:', userData);
        throw new Error('Search query is required');
    }

    try {
       
        const token = await getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const requestBody = JSON.stringify({
            ...userData,
            page: userData.page || 1,
            limit: userData.limit || 10
        });
// const encryptedData = await EncryptionService.encryptRequest(requestBody);
        const response = await fetchWithDecryption('/api/flixsearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: requestBody,
        });
if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Add null checks for response data
        if (!data) {
            throw new Error('Empty response from server');
        }

        // Map API response to match the expected structure
        const typedResponse: FlixSearchResponse = {
            isSuccess: data.isSuccess ?? false,
            message: data.message ?? '',
            data: Array.isArray(data.data) ? data.data.map((item: any) => ({
                coverFile: item.coverFile || '',
                id: item.id || 0,
                title: item.title || '',
                type: item.type || 'post',
                userProfileImage: item.userProfileImage || '',
                userid: item.userid || 0,
                username: item.username || '',
                userFullName: item.userFullName || '' // Add userFullName mapping
            })) : []
        };
return typedResponse;

    } catch (error) {
        console.error('Search failed:', {
            error,
            request: userData,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });

        // Return a properly structured error response
        return {
            isSuccess: false,
            message: error instanceof Error ? error.message : 'Search failed',
            data: []
        };
    }
}

export { flixSearch };
export type { FlixSearchRequest, FlixSearchResponse, SearchResultItem };