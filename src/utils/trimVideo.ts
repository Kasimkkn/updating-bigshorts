export interface TrimVideoResult {
    success: boolean;
    url?: string;
    blob?: Blob;
    fileName?: string;
    error?: string;
}

export const trimVideo = async (
    file: Blob, 
    startTime: number, 
    endTime: number
  ): Promise<TrimVideoResult> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('video', file);
      formData.append('startTime', startTime.toString());
      formData.append('endTime', endTime.toString());
// Call the API
      const response = await fetch('/api/trim-video', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        // Try to get error details if available
        let errorMessage = 'Failed to trim video. Server returned status: ' + response.status;
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If we can't parse the error as JSON, use the default message
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to trim video');
      }
      
      // Convert base64 data to a Blob
      const trimmedVideoBlob = base64ToBlob(
        result.trimmedVideo.data,
        result.trimmedVideo.mimeType
      );
      
      // Create a URL for the blob
      const trimmedVideoUrl = URL.createObjectURL(trimmedVideoBlob);
      
      return {
        success: true,
        url: trimmedVideoUrl,
        blob: trimmedVideoBlob,
        fileName: result.trimmedVideo.fileName
      };
    } catch (error) {
      console.error('Error trimming video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
};

// Helper function to convert base64 to Blob
const base64ToBlob = (base64: string, mimeType: string) => {
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([arrayBuffer], { type: mimeType });
};