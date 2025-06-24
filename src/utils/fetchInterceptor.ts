// src/utils/fetchInterceptor.ts
import EncryptionService from '@/services/encryptionService';

// Use a Set to track URLs being processed to prevent recursion
const processingUrls = new Set<string>();

// Helper function to get a unique identifier for the request
function getRequestKey(input: RequestInfo | URL, init?: RequestInit): string {
  const url = input instanceof Request ? input.url : input.toString();
  const method = init?.method || (input instanceof Request ? input.method : 'GET');
  return `${method}:${url}`;
}

// Wrap the global fetch to intercept all responses
export async function interceptedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const requestKey = getRequestKey(input, init);

  // Check if we're already processing this exact request to prevent recursion
  if (processingUrls.has(requestKey)) {
    // If we're already handling this request, use the original fetch
    return fetch(input, init);
  }

  // Mark that we're processing this request
  processingUrls.add(requestKey);

  try {
    // Perform the original fetch
    const response = await fetch(input, init);

    // Check if response is ok
    if (!response.ok) {
      return response;
    }

    // Check content type before attempting to parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Not JSON, return the original response
      return response;
    }

    // Clone the response to allow reading body multiple times
    const clonedResponse = response.clone();

    try {
      // Parse the response JSON
      const responseData = await clonedResponse.json();

      // Check if response is encrypted and has the expected structure
      if (responseData &&
        typeof responseData === 'object' &&
        responseData.isEncrypted === true &&
        responseData.iv &&
        responseData.data) {

        const decryptedData = await EncryptionService.decryptResponse({
          iv: responseData.iv,
          data: responseData.data,
          isCompressed: responseData.isCompressed || false
        });

        // Create a new response with decrypted data
        return new Response(JSON.stringify(decryptedData), {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(response.headers) // Create new Headers object
        });
      }

      // Response is not encrypted or doesn't have expected structure, return original
      return response;

    } catch (parseError) {
      console.error('Response Parsing Error:', parseError);
      // If response cannot be parsed as JSON, return original response
      return response;
    }

  } catch (fetchError) {
    console.error('Fetch Interception Failed:', fetchError);
    // Re-throw the error to maintain the original behavior
    throw fetchError;
  } finally {
    // Always clean up our processing flag
    processingUrls.delete(requestKey);
  }
}

// Alternative safer version that doesn't modify global fetch
export const fetchWithDecryption = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  try {
    // Perform the fetch
    const response = await fetch(input, init);

    // Check if response is ok
    if (!response.ok) {
      return response;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return response;
    }

    // Clone and try to parse
    const clonedResponse = response.clone();

    try {
      const responseData = await clonedResponse.json();

      // Check if encrypted
      if (responseData &&
        typeof responseData === 'object' &&
        responseData.isEncrypted === true &&
        responseData.iv &&
        responseData.data) {

        const decryptedData = await EncryptionService.decryptResponse({
          iv: responseData.iv,
          data: responseData.data,
          isCompressed: responseData.isCompressed || false
        });

        return new Response(JSON.stringify(decryptedData), {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(response.headers)
        });
      }

      return response;

    } catch (parseError) {
      console.warn('Could not parse response as JSON, returning original:', parseError);
      return response;
    }

  } catch (error) {
    console.error('fetchWithDecryption error:', error);
    throw error;
  }
};

// Override global fetch only in browser environment (optional - use with caution)
export const enableGlobalFetchInterception = () => {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;

    window.fetch = async (input, init) => {
      try {
        return await interceptedFetch(input, init);
      } catch (error) {
        console.error('Global fetch interception failed, falling back to original fetch:', error);
        return originalFetch(input, init);
      }
    };

    // Mark that we've intercepted to prevent double interception
    (window.fetch as any).__intercepted = true;
  }
};