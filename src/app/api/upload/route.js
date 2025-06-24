import { NextResponse } from 'next/server';
import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import os from 'os';

// Filename sanitization function
const sanitizeFileName = (fileName) => {
  try {
    // Remove non-ASCII characters and keep only alphanumeric with few safe characters
    let sanitized = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace any non-alphanumeric (except dots and hyphens) with underscore
      .replace(/[^\x00-\x7F]/g, '') // Remove all non-ASCII characters
      .replace(/_+/g, '_') // Replace multiple underscores with single
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
    console.error('Error sanitizing filename:', e);
    return `file_${Date.now()}`;
  }
};

// Helper function to upload file to S3
const uploadFileToS3 = (fileBuffer, presignedUrl, fileType) => {
  return new Promise((resolve, reject) => {
    const url = new URL(presignedUrl);
    
    const options = {
      method: 'PUT',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': fileType,
        'Content-Length': fileBuffer.length
      }
    };

    const httpReq = http.request(options, (httpRes) => {
      if (httpRes.statusCode === 200) {
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          statusCode: httpRes.statusCode
        });
      }
    });

    httpReq.on('error', (err) => reject(err));
    httpReq.write(fileBuffer);
    httpReq.end();
  });
};

export async function POST(req) {
  const tempDir = path.join(os.tmpdir(), uuidv4());

  try {
    // Ensure the full path exists, including nested directories
    await mkdir(tempDir, { recursive: true });

    // Get the FormData from the request
    const formData = await req.formData();

    // Get file and presigned URL from form data
    const file = formData.get('file');
    const presignedUrl = formData.get('presignedUrl');
    const fileType = formData.get('type') || 'default';

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({
        success: false,
        message: 'No file uploaded or invalid file'
      }, { status: 400 });
    }

    // Get file data as ArrayBuffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Sanitize the original filename
    const originalFileName = file.name || 'uploaded-file';
    const sanitizedFileName = sanitizeFileName(
      originalFileName.length > 10
        ? originalFileName.substring(originalFileName.length - 10)
        : originalFileName
    );

    // Create a unique filename with UUID
    const uuid = uuidv4();
    const finalFileName = `${uuid}_${sanitizedFileName}`;

    // Construct S3-like path
    const s3Path = path.join('Bigshorts', 'Flix', `${fileType}Files`, finalFileName);
    
    // Determine the full file path
    const tempFilePath = path.join(tempDir, s3Path);
    const fileDir = path.dirname(tempFilePath);
    
    // Ensure the directory for the file exists
    await mkdir(fileDir, { recursive: true });

    // Write file to temp directory
    await writeFile(tempFilePath, fileBuffer);

    // Upload the file to S3 using the presigned URL
const uploadResponse = await uploadFileToS3(
      fileBuffer,
      presignedUrl,
      file.type
    );

    if (!uploadResponse.success) {
      console.error(`Failed to upload file. Status code: ${uploadResponse.statusCode}`);
      return NextResponse.json({
        success: false,
        message: 'Failed to upload file',
        statusCode: uploadResponse.statusCode
      }, { status: 500 });
    }
return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename: finalFileName,
      s3Path: s3Path
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing file',
      error: error.message
    }, { status: 500 });

  } finally {
    // Clean up temp directory
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Error cleaning up temp directory:', cleanupError);
    }
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';