// FileDetails.ts
export interface FileDetails {
    fileName: string;
    contentType: string;
  }
  
  export function fileDetailsFromJson(json: any): FileDetails {
    return {
      fileName: json.fileName,
      contentType: json.contentType,
    };
  }
  
  export function fileDetailsToJson(value: FileDetails): any {
    return {
      fileName: value.fileName,
      contentType: value.contentType,
    };
  }
  
  // PresignedUrl.ts
  export interface PresignedUrl {
    fileName: string;
    url: string;
  }
  
  export function presignedUrlFromJson(json: any): PresignedUrl {
    return {
      fileName: json.fileName,
      url: json.url,
    };
  }
  
  export function presignedUrlToJson(value: PresignedUrl): any {
    return {
      fileName: value.fileName,
      url: value.url,
    };
  }
  
  // PresignedUrlResponse.ts
  export interface PresignedUrlResponse {
    urls: PresignedUrl[];
  }
  
  export function presignedUrlResponseFromJson(json: any): PresignedUrlResponse {
    return {
      urls: json.urls.map((url: any) => presignedUrlFromJson(url)),
    };
  }
  
  export function presignedUrlResponseToJson(value: PresignedUrlResponse): any {
    return {
      urls: value.urls.map((url) => presignedUrlToJson(url)),
    };
  }
  