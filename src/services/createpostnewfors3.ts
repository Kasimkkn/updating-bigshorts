import { fetchWithDecryption } from "@/utils/fetchInterceptor";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface CreatePostResponse {
  isSuccess: boolean;
  message: string;
  data: string;
}

async function createPostForS3(userData: any): Promise<CreatePostResponse> {
  try {
    const encryptedData = await EncryptionService.encryptRequest(userData);
    let token = await getAuthToken();
    
    // Remove the AbortController as it might be causing issues with Vercel
    const response = await fetchWithDecryption('/api/createpost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        // Removed the custom X-Timeout-Request header
      },
      body: JSON.stringify(encryptedData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data: CreatePostResponse = await response.json();
    return data;
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error in createPostForS3:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    if (error instanceof TypeError) {
      console.error('Network error:', error.message);
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    // Rethrow with more user-friendly message
    throw new Error(`Failed to create post: ${error.message}`);
  }
}

export { createPostForS3 };
export type { CreatePostResponse };