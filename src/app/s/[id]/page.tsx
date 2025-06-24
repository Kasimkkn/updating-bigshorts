'use client';
import { getPostDetails } from '@/services/getpostdetails';
import CryptoJS from 'crypto-js';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InAppRedirectionProvider, useInAppRedirection } from '../../../context/InAppRedirectionContext';

// Constants that exactly match your Flutter SecureLinkHandler class
const KEY = 'YourSecureKeyHere32CharactersLong'; // Replace with your actual key from Flutter
const IV = 'YourSecureIvHere'; // Replace with your actual IV from Flutter
const SEPARATOR = ':::'; // Same separator as Flutter

/**
 * Decodes a secure link following the same logic as Flutter's SecureLinkHandler
 */
function decodeSecureLink(encoded: string): { type: string; id: string } | null {
  try {
    // Step 1: Handle URL-encoded characters first (like %3D for =)
    let processedInput = encoded;
    if (processedInput.includes('%')) {
      try {
        processedInput = decodeURIComponent(processedInput);
      } catch (urlDecodeError) {
        // Manual replacement of common URL encodings
        processedInput = processedInput
          .replace(/%3D/gi, '=') // = sign
          .replace(/%2B/gi, '+') // + sign
          .replace(/%2F/gi, '/') // / sign
          .replace(/%3A/gi, ':') // : sign
          .replace(/%3B/gi, ';') // ; sign
          .replace(/%3F/gi, '?') // ? sign
          .replace(/%40/gi, '@') // @ sign
          .replace(/%26/gi, '&') // & sign
          .replace(/%23/gi, '#') // # sign
          .replace(/%25/gi, '%'); // % sign
      }
    }

    // Step 2: Direct Base64 decoding check for standard Base64 strings
    if (/^[A-Za-z0-9+/]*={0,2}$/.test(processedInput)) {
      try {
        const bytes = CryptoJS.enc.Base64.parse(processedInput);
        const decoded = CryptoJS.enc.Utf8.stringify(bytes);

        if (decoded.includes(SEPARATOR)) {
          const parts = decoded.split(SEPARATOR);
          if (parts.length >= 2) {
            return {
              type: parts[0],
              id: parts[1]
            };
          }
        }
      } catch (directDecodeError) {
        // Continue to next method
      }
    }

    // Step 3: Handle URL-safe Base64 (convert to standard Base64)
    let standardBase64 = processedInput.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed - very important for Base64 decoding
    while (standardBase64.length % 4 !== 0) {
      standardBase64 += '=';
    }

    // Step 4: Try primary decryption (AES) - matching Flutter implementation
    try {
      // Create key and IV
      const key = CryptoJS.enc.Utf8.parse(KEY);
      const iv = CryptoJS.enc.Utf8.parse(IV);

      // First convert the Base64 string to bytes
      const cipherBytes = CryptoJS.enc.Base64.parse(standardBase64);

      // Create a proper CipherParams object for CryptoJS
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: cipherBytes
      });

      // Decrypt using AES-CBC
      const decrypted = CryptoJS.AES.decrypt(
        cipherParams,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      // Convert to UTF-8 string
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

      // Parse JSON - this will throw an error if not valid JSON
      const data = JSON.parse(decryptedText);

      // Return the expected structure
      return {
        type: data.type,
        id: data.id
      };
    } catch (e) {
      // Step 5: Try fallback decoding (direct Base64) - matching Flutter fallback
      try {
        // This matches the Flutter utf8.decode(base64Url.decode(encoded))
        const bytes = CryptoJS.enc.Base64.parse(standardBase64);
        const decoded = CryptoJS.enc.Utf8.stringify(bytes);

        // Check if it contains the separator
        if (decoded.includes(SEPARATOR)) {
          const parts = decoded.split(SEPARATOR);
          // Return the expected structure
          return {
            type: parts[0],
            id: parts[1]
          };
        }
      } catch (fallbackError) {
        // Continue to final fallback
      }
    }

    // Step 6: Last resort - check if the raw string contains the separator
    if (processedInput.includes(SEPARATOR)) {
      const parts = processedInput.split(SEPARATOR);
      if (parts.length >= 2) {
        return {
          type: parts[0],
          id: parts[1]
        };
      }
    }

    // If all decoding methods fail
    return null;
  } catch (e) {
    return null;
  }
}

// Main page component
function SecureLinkRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Use the inAppRedirection context with all needed functions
  const {
    setInAppFlixData,
    clearFlixData,
    setInAppSnipsData,
    setSnipIndex,
    setProfilePostData,
    setProfilePostId
  } = useInAppRedirection();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to handle redirect based on content type
  const handleRedirect = (type: string, data: any[], index: number) => {
    // Make sure we have valid data
    if (!Array.isArray(data) || data.length === 0 || index < 0 || index >= data.length) {
      return;
    }

    // Get the current item
    const currentItem = data[index];

    if (type === "snips") {
      // Get the postId
      const postId = currentItem?.postId || currentItem?.id;
      if (!postId) {
        router.push('/home');
        return;
      }

      if (currentItem) {
        // Set data in context
        if (Array.isArray(data) && data.length > 0) {
          setInAppSnipsData(data);
          setSnipIndex(0);
        } else {
          // Single item case
          const snipsData = [currentItem];
          setInAppSnipsData(snipsData);
          setSnipIndex(0);
        }
        router.push(`/home/posts-redirect/${postId}`);
      } else {
        router.push('/home');
      }
    }
    else if (type === "posts") {
      // Get the postId
      const postId = currentItem?.postId || currentItem?.id;
      if (!postId) {
        router.push('/home');
        return;
      }

      setTimeout(() => {
        router.push(`/home/posts-redirect/${postId}`);
      }, 300);
    }
    else if (type === "flix") {
      clearFlixData();
      // Get the postId from various possible properties
      const postId = currentItem?.postId || currentItem?.id || currentItem?.flixid;
      if (!postId) {
        router.push('/home');
        return;
      }

      setInAppFlixData(currentItem);
      // Small delay to ensure state is set
      setTimeout(() => {
        router.push(`/home/flix/${postId}`);
      }, 300);
    } else {
      router.push('/home');
    }
  };

  // Handle the redirection process
  useEffect(() => {
    const handleRedirection = async () => {
      try {
        // Check if the ID is available
        if (!id) {
          return;
        }

        // Try to decode the link
        const decodedData = decodeSecureLink(id);

        if (decodedData) {
          // Handle different content types
          switch (decodedData.type) {
            case 'flix':
              try {
                // Fetch post details for flix
                const response = await getPostDetails(decodedData.id);
                if (response.isSuccess && response.data && response.data.length > 0) {
                  // Check if the post is for interactive image
                  const isForInteractive = response.data[0]?.isForInteractiveImage === 1;
                  if (isForInteractive) {
                    // Make sure we're properly formatting the data
                    const processedData = response.data.map((item: any) => {
                      // Ensure each item has a postId property
                      return {
                        ...item,
                        // Use existing postId or fall back to id or flixid
                        postId: item.postId || item.id || item.flixid
                      };
                    });
                    // Use index 0 for the first item
                    handleRedirect("posts", processedData, 0);
                  } else {
                    // Not an interactive image
                    // Use handleRedirect for non-interactive images
                    handleRedirect("snips", response.data, 0);
                  }
                } else {
                  // If there's a user ID in the error message, handle it
                  if (response.message && response.message.includes("userid:")) {
                    const userId = response.message.split(":")[1].split(" ")[0];
                    // Handle any special user ID related logic here
                  }
                  // Fallback to home
                  router.push('/');
                }
              } catch (apiError) {
                // Fallback to home on error
                router.push('/');
              }
              break;

            case 'longform':
              router.push(`/home/flix/${decodedData.id}`);
              break;

            case 'snip':
              router.push(`/home/snip/${decodedData.id}`);
              break;

            default:
            // router.push('/');
          }
        } else {
          // router.push('/');
        }
      } catch (error) {
        // router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    // Run the redirection logic when ID is available
    if (id) {
      handleRedirection();
    }
  }, [
    id,
    router,
    setInAppFlixData,
    setProfilePostData,
    setProfilePostId,
    setInAppSnipsData,
    setSnipIndex,
    clearFlixData
  ]);

  // Main loading UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600 mb-4">Taking you to your content on BigShorts</p>
      </div>
    </div>
  );
}

export default function SecureLinkRedirectWrapper() {
  return (
    <InAppRedirectionProvider>
      <SecureLinkRedirect />
    </InAppRedirectionProvider>
  );
}