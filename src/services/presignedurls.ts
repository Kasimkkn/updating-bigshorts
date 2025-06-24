// client-side function
import { CommonResponse } from "@/models/commonResponse";
import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface PresignedUrl {
  fileName: string;
  url: string;
}

interface PresignedUrlRequest {
  files: { fileName: string }[];
  contentType: string;
}

interface PresignedUrlResponse extends CommonResponse<PresignedUrl[]> {
  urls: PresignedUrl[];
}

 async function fetchPresignedUrls(files: { fileName: string }[], contentType: string): Promise<string[]> {
  try {
    const encryptedData = await EncryptionService.encryptRequest({ files, contentType });
    let token = await getAuthToken();
    const requestData: PresignedUrlRequest = {
      files,
      contentType,
    };
    
    // Add the cache-busting parameter to the URL instead of using a header
    // This works consistently across browsers including Safari
    const cacheBuster = `cacheBust=${Date.now()}`;
    const url = `/api/presignedurls`;
    
    const response = await fetchWithDecryption(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // X-Cache-Bust header removed
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: PresignedUrlResponse = await response.json();
    
    // For debugging
// Map to extract URLs as strings
    return data.urls.map((item) => item.url);
  } catch (error) {
    console.error('Failed to fetch presigned URLs:', error);
    throw error;
  }
}

export { fetchPresignedUrls }
export type { PresignedUrl, PresignedUrlResponse }
