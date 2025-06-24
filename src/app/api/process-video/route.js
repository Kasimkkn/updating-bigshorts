import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, rm } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import os from 'os';
import { spawn, exec } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static'; // Import the ffmpeg-static package


const FFMPEG_PATH = path.join(process.cwd(), 'ffmpeg', 'ffmpeg');






// Set the FFmpeg path
ffmpeg.setFfmpegPath(FFMPEG_PATH);
// Verify FFmpeg installation
const verifyFFmpegInstallation = () => {
  return new Promise((resolve, reject) => {
    exec(`${FFMPEG_PATH} -version`, (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg verification error:', error);
        return reject(error);
      }

      // Log version information
resolve(true);
    });
  });
};

// Fallback audio extraction method
const extractAudioFallback = (videoFilePath, outputAudioPath) => {
  return new Promise((resolve, reject) => {
    const process = spawn(FFMPEG_PATH, [
      '-i', videoFilePath,
      '-vn',          // Disable video
      '-acodec', 'libmp3lame',
      outputAudioPath
    ]);

    process.on('error', (err) => {
      console.error('Audio extraction spawn error:', err);
      reject(err);
    });

    process.stdout.on('data', (data) => {
});

    process.stderr.on('data', (data) => {
});

    process.on('close', (code) => {
      if (code === 0) {
        resolve(outputAudioPath);
      } else {
        reject(new Error(`Audio extraction failed with code ${code}`));
      }
    });
  });
};

// Fallback cover image extraction
const extractCoverImageFallback = (videoFilePath, outputImagePath, extractDuration = 1) => {
  return new Promise((resolve, reject) => {
    const process = spawn(FFMPEG_PATH, [
      '-i', videoFilePath,
      '-ss', `${extractDuration}`,
      '-vframes', '1',
      outputImagePath
    ]);

    process.on('error', (err) => {
      console.error('Cover image extraction spawn error:', err);
      reject(err);
    });

    process.stdout.on('data', (data) => {
});

    process.stderr.on('data', (data) => {
});

    process.on('close', (code) => {
      if (code === 0) {
        resolve(outputImagePath);
      } else {
        reject(new Error(`Cover image extraction failed with code ${code}`));
      }
    });
  });
};

// Set FFmpeg path for fluent-ffmpeg
ffmpeg.setFfmpegPath(FFMPEG_PATH);

export async function POST(req) {
  const tempDir = path.join(os.tmpdir(), uuidv4());

  try {
    // Verify FFmpeg installation
    try {
      await verifyFFmpegInstallation();
    } catch (verificationError) {
      return NextResponse.json({
        success: false,
        message: 'FFmpeg verification failed',
        error: verificationError.message,
        ffmpegPath: FFMPEG_PATH
      }, { status: 500 });
    }

    // Create temp directory
    await mkdir(tempDir, { recursive: true });

    // Get the FormData from the request
    const formData = await req.formData();

    // Get file and presigned URL from form data
    const file = formData.get('file');
    const presignedUrl = formData.get('presignedUrl');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({
        success: false,
        message: 'No file uploaded or invalid file'
      }, { status: 400 });
    }

    // Get file data as ArrayBuffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || 'uploaded-file';
    const tempFilePath = path.join(tempDir, fileName);

    // Write file to temp directory
    await writeFile(tempFilePath, fileBuffer);

    // Step 1: Upload the video to S3
    const videoUploadResponse = await uploadFileToS3(
      fileBuffer,
      presignedUrl,
      file.type
    );

    if (!videoUploadResponse.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to upload video to S3'
      }, { status: 500 });
    }
let audioOutputPath = null;
    let audioDuration = null;
    let audioBuffer = null;
    let imageBuffer = null;

    // Step 2: Extract audio from the video (attempt)
    try {
      const audioUUID = uuidv4();
      audioOutputPath = path.join(tempDir, `audio_${audioUUID}.mp3`);

      await extractAudioFallback(tempFilePath, audioOutputPath);

      // Try to get audio duration
      try {
        const durationProcess = spawn(FFMPEG_PATH, [
          '-i', audioOutputPath,
          '-show_entries', 'format=duration',
          '-v', 'quiet',
          '-of', 'csv=p=0'
        ]);

        durationProcess.stdout.on('data', (data) => {
          audioDuration = parseFloat(data.toString().trim());
        });

        await new Promise((resolve, reject) => {
          durationProcess.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error('Failed to get audio duration'));
          });
        });
      } catch (durationError) {
}

      audioBuffer = await readFile(audioOutputPath);
    } catch (audioError) {
}

    // Step 3: Extract cover image from the video
    const imageUUID = uuidv4();
    const imageOutputPath = path.join(tempDir, `cover.jpg`);
    const extractDuration = 1; // Extract image at 1 second

    try {
      await extractCoverImageFallback(tempFilePath, imageOutputPath, extractDuration);

      imageBuffer = await readFile(imageOutputPath);
    } catch (imageError) {
      console.error('Error extracting cover image:', imageError);
      return NextResponse.json({
        success: false,
        message: 'Failed to extract cover image',
        error: imageError.message
      }, { status: 500 });
    }

    // Step 4: Respond with the available audio and image data
    return NextResponse.json({
      success: true,
      message: 'Video processed successfully',
      audioPath: audioOutputPath || null,
      imagePath: imageOutputPath,
      audioFileName: audioOutputPath ? path.basename(audioOutputPath) : null,
      imageFileName: path.basename(imageOutputPath),
      audioBuffer: audioBuffer ? audioBuffer.toString('base64') : null,
      imageBuffer: imageBuffer ? imageBuffer.toString('base64') : null,
      audioDuration: audioDuration || null,
      ffmpegPath: FFMPEG_PATH
    });

  } catch (error) {
    console.error('Error processing video:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing video',
      error: error.message,
      ffmpegPath: FFMPEG_PATH
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
const uploadFileToS3 = (fileBuffer, presignedUrl, fileType) => {
  return new Promise((resolve, reject) => {
    try {

      // Validate URL
      if (!presignedUrl) {
        console.error('No presigned URL provided');
        return reject(new Error('No presigned URL provided'));
      }

      const url = new URL(presignedUrl);

      // Log detailed URL components
// Log all search parameters
      const urlParams = Object.fromEntries(url.searchParams);
const options = {
        method: 'PUT',
        hostname: url.hostname,
        path: url.pathname + url.search,
        headers: {
          'Content-Type': fileType,
          'Content-Length': fileBuffer.length,
        }
      };

      const httpReq = http.request(options, (httpRes) => {
// Collect response body for detailed logging
        let responseBody = '';
        httpRes.on('data', (chunk) => {
          responseBody += chunk.toString();
        });

        httpRes.on('end', () => {
          if (httpRes.statusCode === 200) {
            resolve({ success: true });
          } else {
            console.error('S3 Upload Failed:', {
              statusCode: httpRes.statusCode,
              responseBody: responseBody
            });

            resolve({
              success: false,
              statusCode: httpRes.statusCode,
              body: responseBody
            });
          }
        });
      });

      httpReq.on('error', (err) => {
        console.error('S3 Upload Request Error:', {
          errorName: err.name,
          errorMessage: err.message,
          errorStack: err.stack
        });
        reject(err);
      });

      httpReq.write(fileBuffer);
      httpReq.end();
    } catch (setupError) {
      console.error('S3 Upload Setup Error:', {
        errorName: setupError.name,
        errorMessage: setupError.message,
        errorStack: setupError.stack
      });
      reject(setupError);
    }
  });
};
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
