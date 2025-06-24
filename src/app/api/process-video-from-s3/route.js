// Updated /api/process-video-from-s3/route.js using your Dio headers
import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, rm } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import os from 'os';
import { spawn, exec } from 'child_process';

const FFMPEG_PATH = path.join(process.cwd(), 'ffmpeg', 'ffmpeg');

// Download function using the same headers as your Dio configuration
const downloadFile = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(outputPath);
    
    console.log('Downloading from URL:', url);
    
    const urlObj = new URL(url);
    
    // Use the exact same headers as your Dio configuration
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'BigShort/1.0 (iOS; Mobile)',
        'Accept': '*/*',
        'Accept-Encoding': 'identity', // Disable compression for binary files
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // CloudFront specific headers
        'X-Forwarded-Proto': 'https',
      }
    };
    
    console.log('Using headers:', options.headers);
    
    const req = https.request(options, (response) => {
      console.log('Download response status:', response.statusCode);
      console.log('Response headers:', response.headers);
      
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log('Redirect to:', response.headers.location);
        file.close();
        require('fs').unlink(outputPath, () => {});
        // Follow redirect with same headers
        return downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        require('fs').unlink(outputPath, () => {});
        
        // Collect error response body for debugging
        let errorBody = '';
        response.on('data', (chunk) => {
          errorBody += chunk.toString();
        });
        response.on('end', () => {
          console.log('Error response body:', errorBody);
          reject(new Error(`Failed to download file: ${response.statusCode} - ${errorBody}`));
        });
        return;
      }
      
      // Track download progress (similar to your Dio onReceiveProgress)
      let downloadedBytes = 0;
      const totalBytes = parseInt(response.headers['content-length']) || 0;
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (totalBytes > 0) {
          const percentage = Math.floor((downloadedBytes / totalBytes) * 100);
          if (percentage % 10 === 0) { // Log every 10%
            console.log(`Download progress: ${percentage}%`);
          }
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('File downloaded successfully');
        console.log(`Total downloaded: ${downloadedBytes} bytes`);
        resolve(outputPath);
      });
      
      file.on('error', (err) => {
        console.error('File write error:', err);
        require('fs').unlink(outputPath, () => {});
        reject(err);
      });
    });
    
    req.on('error', (err) => {
      console.error('HTTPS request error:', err);
      reject(err);
    });
    
    req.setTimeout(60000, () => { // 60 second timeout for large video files
      console.error('Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
};

// Verify FFmpeg installation
const verifyFFmpegInstallation = () => {
  return new Promise((resolve, reject) => {
    exec(`${FFMPEG_PATH} -version`, (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg verification error:', error);
        return reject(error);
      }
      resolve(true);
    });
  });
};

// Extract audio using spawn
const extractAudioFallback = (videoFilePath, outputAudioPath) => {
  return new Promise((resolve, reject) => {
    const process = spawn(FFMPEG_PATH, [
      '-i', videoFilePath,
      '-vn',
      '-acodec', 'libmp3lame',
      '-y',
      outputAudioPath
    ]);

    process.on('error', (err) => {
      console.error('Audio extraction spawn error:', err);
      reject(err);
    });

    process.stderr.on('data', (data) => {
      console.log('FFmpeg stderr:', data.toString());
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

// Extract cover image using spawn
const extractCoverImageFallback = (videoFilePath, outputImagePath, extractDuration = 1) => {
  return new Promise((resolve, reject) => {
    const process = spawn(FFMPEG_PATH, [
      '-i', videoFilePath,
      '-ss', `${extractDuration}`,
      '-vframes', '1',
      '-y',
      outputImagePath
    ]);

    process.on('error', (err) => {
      console.error('Cover image extraction spawn error:', err);
      reject(err);
    });

    process.stderr.on('data', (data) => {
      console.log('FFmpeg stderr:', data.toString());
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

// Get audio duration
const getAudioDuration = (audioPath) => {
  return new Promise((resolve, reject) => {
    const process = spawn(FFMPEG_PATH, [
      '-i', audioPath,
      '-show_entries', 'format=duration',
      '-v', 'quiet',
      '-of', 'csv=p=0'
    ]);

    let duration = '';
    process.stdout.on('data', (data) => {
      duration += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        const parsedDuration = parseFloat(duration.trim());
        resolve(parsedDuration || 0);
      } else {
        reject(new Error('Failed to get audio duration'));
      }
    });
  });
};

export async function POST(req) {
  const tempDir = path.join(os.tmpdir(), uuidv4());

  try {
    // Verify FFmpeg installation
    await verifyFFmpegInstallation();
    console.log('FFmpeg verification successful');

    // Create temp directory
    await mkdir(tempDir, { recursive: true });

    // Get the JSON data from the request
    const { videoUrl, fileName } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({
        success: false,
        message: 'No video URL provided'
      }, { status: 400 });
    }

    console.log('Processing video from URL:', videoUrl);

    // Download video using the same headers as your Dio configuration
    const tempVideoPath = path.join(tempDir, fileName || 'video.mp4');
    await downloadFile(videoUrl, tempVideoPath);
    console.log('Video downloaded successfully');

    let audioOutputPath = null;
    let audioDuration = null;
    let audioBuffer = null;
    let imageBuffer = null;
    let audioFileName = null;

    // Extract audio from the video
    try {
      const audioUUID = uuidv4();
      audioFileName = `audio_${audioUUID}.mp3`;
      audioOutputPath = path.join(tempDir, audioFileName);
      
      console.log('Extracting audio...');
      await extractAudioFallback(tempVideoPath, audioOutputPath);
      console.log('Audio extracted successfully');
      
      // Get audio duration
      try {
        audioDuration = await getAudioDuration(audioOutputPath);
        console.log('Audio duration:', audioDuration, 'seconds');
      } catch (durationError) {
        console.error('Error getting audio duration:', durationError);
        audioDuration = 30;
      }

      audioBuffer = await readFile(audioOutputPath);
      console.log('Audio buffer size:', audioBuffer.length, 'bytes');
    } catch (audioError) {
      console.error('Error extracting audio:', audioError);
    }

    // Extract cover image from the video
    const imageUUID = uuidv4();
    const imageFileName = `cover_${imageUUID}.jpg`;
    const imageOutputPath = path.join(tempDir, imageFileName);
    const extractDuration = Math.min(1, (audioDuration || 30) / 2);

    try {
      console.log('Extracting cover image at', extractDuration, 'seconds');
      await extractCoverImageFallback(tempVideoPath, imageOutputPath, extractDuration);
      console.log('Cover image extracted successfully');
      
      imageBuffer = await readFile(imageOutputPath);
      console.log('Image buffer size:', imageBuffer.length, 'bytes');
    } catch (imageError) {
      console.error('Error extracting cover image:', imageError);
      return NextResponse.json({
        success: false,
        message: 'Failed to extract cover image',
        error: imageError.message
      }, { status: 500 });
    }

    // Return the processed data as base64
    return NextResponse.json({
      success: true,
      message: 'Video processed successfully',
      audioFileName: audioFileName,
      imageFileName: imageFileName,
      audioBuffer: audioBuffer ? audioBuffer.toString('base64') : null,
      imageBuffer: imageBuffer ? imageBuffer.toString('base64') : null,
      audioDuration: audioDuration ? audioDuration.toString() : '30',
    });

  } catch (error) {
    console.error('Error processing video:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing video',
      error: error.message
    }, { status: 500 });
  } finally {
    // Clean up temp directory
    try {
      await rm(tempDir, { recursive: true, force: true });
      console.log('Temp directory cleaned up');
    } catch (cleanupError) {
      console.error('Error cleaning up temp directory:', cleanupError);
    }
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';