import { fetchPresignedUrls } from '@/services/presignedurls';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique ID using UUID
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Uploads an image file to cloud storage and returns the final URL
 * @param file - The image file to upload
 * @returns A Promise that resolves to the cloud URL of the uploaded image or null if upload fails
 */

type Folder = "InteractiveVideos" | "InteractiveImages" | "coverFiles" | "audioFiles";
interface ProcessVideoResponse {
  videoUrl: string;
  coverImageBuffer?: string; // base64 string
  audioBuffer?: string;      // base64 string
  audioDuration?: string;
  coverImageFileName?: string;
  audioFileName?: string;
}

export const uploadImage = async (file: File, folder: Folder, isForFlix: boolean, url = ""): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      // Create a unique filename with UUID
      const sanitizedFileName = sanitizeFileName(file.name)
      const filenameImage = url ? url : `Bigshorts/${isForFlix ? 'LongForm' : 'Flix'}/${folder}/${generateUUID()}_${file.name}`;

      // Prepare file details for presigned URL
      const imageFileDetails = [{ fileName: filenameImage, contentType: file.type }];

      // Fetch presigned URL for upload
      fetchPresignedUrls(imageFileDetails, file.type)
        .then((presignedUrls) => {
          const presignedUrl = presignedUrls[0];

          // Prepare form data for upload
          const imageFormData = new FormData();
          imageFormData.append('file', file);
          imageFormData.append('filePath', filenameImage);
          imageFormData.append('presignedUrl', presignedUrl);

          // Use XMLHttpRequest to upload the file
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `/api/upload`, true);

          xhr.onload = function () {
            if (xhr.status === 200) {
              const imageResponse = JSON.parse(xhr.responseText);
              if (imageResponse.success) {
                // Construct the final cloud URL
                const imageUrl = `https://d1332u4stxguh3.cloudfront.net/${filenameImage}`;
                resolve(imageUrl);
              } else {
                console.error('Image upload failed:', imageResponse.message);
                resolve(null);
              }
            } else {
              console.error(`HTTP error! status: ${xhr.status}`);
              resolve(null);
            }
          };

          xhr.onerror = function () {
            console.error('Error uploading file due to network error.');
            resolve(null);
          };

          xhr.send(imageFormData);
        })
        .catch((error) => {
          console.error("Failed to fetch presigned URLs:", error);
          resolve(null);
        });
    } catch (error) {
      console.error('Error in upload process:', error);
      resolve(null);
    }
  });
};

export const processVideo = async (
  file: File,
  folder: Folder = "InteractiveVideos",
  isForFlix: boolean = false,
  url = ""
): Promise<ProcessVideoResponse> => {
  return new Promise((resolve, reject) => {
    try {
      const contentType = file.type || "video/mp4";
      const sanitizedFile = sanitizeFileName(file.name);
      const fileName = url ? url : `Bigshorts/${isForFlix ? 'LongForm' : 'Flix'}/${folder}/${generateUUID()}_${sanitizedFile}`;
      const videoUrl = `https://d1332u4stxguh3.cloudfront.net/${fileName}`;
      const fileDetails = [{ fileName, contentType }];

      fetchPresignedUrls(fileDetails, contentType)
        .then((responseUrls) => {
          const presignedUrl = responseUrls[0];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', fileName);
          formData.append('presignedUrl', presignedUrl);

          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/process-video', true);

          xhr.onload = function () {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve({
                  videoUrl,
                  coverImageBuffer: response.imageBuffer,
                  audioBuffer: response.audioBuffer,
                  audioDuration: response.audioDuration,
                  coverImageFileName: response.imageFileName,
                  audioFileName: response.audioFileName
                });
              } else {
                reject(new Error('Video processing failed'));
              }
            } else {
              reject(new Error('Failed to process video'));
            }
          };

          xhr.onerror = function () {
            reject(new Error('Network error during video processing'));
          };

          xhr.send(formData);
        })
        .catch((error) => {
          reject(new Error("Failed to fetch presigned URLs"));
        });
    } catch (error) {
      reject(error);
    }
  });
};

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function sanitizeFileName(fileName: string): string {
  try {
    let sanitized = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace any non-alphanumeric (except dots and hyphens) with underscore
      .replace(/[^\x00-\x7F]/g, '') // Remove all non-ASCII characters
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .trim()
      .toLowerCase();

    // Handle empty filename after sanitization
    if (!sanitized || sanitized === '.') {
      return `file_${Date.now()}`;
    }

    // Handle extension
    const lastDotIndex = sanitized.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // No extension found
      return sanitized.substring(0, Math.min(sanitized.length, 40));
    }

    const name = sanitized.substring(0, lastDotIndex);
    const extension = sanitized.substring(lastDotIndex + 1);

    // If name is empty but has extension
    if (!name) {
      return `file_${Date.now()}.${extension}`;
    }

    // Limit name to 40 characters plus extension
    const truncatedName = name.substring(0, Math.min(name.length, 40));
    return `${truncatedName}.${extension}`;
  } catch (e) {
    console.error('Error sanitizing filename:', (e as Error).message);
    return `file_${Date.now()}`;
  }
}
