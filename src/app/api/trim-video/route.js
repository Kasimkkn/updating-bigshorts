import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, rm } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import { spawn, exec } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';

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

// Trim video function
const trimVideo = (inputPath, outputPath, startTime, endTime) => {
  return new Promise((resolve, reject) => {
const duration = endTime - startTime;
    if (duration <= 0) {
      return reject(new Error('End time must be greater than start time'));
    }
    
    const process = spawn(FFMPEG_PATH, [
      '-i', inputPath,
      '-ss', `${startTime}`,
      '-t', `${duration}`,
      '-c:v', 'libx264', // Use H.264 codec for better compatibility
      '-c:a', 'aac',     // Use AAC for audio
      '-strict', 'experimental',
      '-b:a', '128k',    // Set audio bitrate
      '-movflags', '+faststart', // Optimize for web playback
      outputPath
    ]);
    
    process.on('error', (err) => {
      console.error('Video trimming spawn error:', err);
      reject(err);
    });
    
    let stdoutData = '';
    let stderrData = '';
    
    process.stdout.on('data', (data) => {
      stdoutData += data.toString();
});
    
    process.stderr.on('data', (data) => {
      stderrData += data.toString();
});
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`Video trimming failed with code ${code}\nStdout: ${stdoutData}\nStderr: ${stderrData}`));
      }
    });
  });
};

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
    
    // Parse multipart form data
    const formData = await req.formData();
    
    // Get video file and time parameters
    const file = formData.get('video');
    const startTime = parseFloat(formData.get('startTime') || 0);
    const endTime = parseFloat(formData.get('endTime') || 0);
    
    // Validate inputs
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({
        success: false,
        message: 'No video file uploaded or invalid file'
      }, { status: 400 });
    }
    
    if (isNaN(startTime) || isNaN(endTime) || startTime < 0 || endTime <= startTime) {
      return NextResponse.json({
        success: false,
        message: 'Invalid time parameters. End time must be greater than start time and both must be non-negative.'
      }, { status: 400 });
    }
    
    // Save the video to temp directory
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const inputFileName = `input_${uuidv4()}${path.extname(file.name || 'video.mp4')}`;
    const inputFilePath = path.join(tempDir, inputFileName);
    
    await writeFile(inputFilePath, fileBuffer);
    
    // Prepare output path
    const outputFileName = `trimmed_${uuidv4()}.mp4`;
    const outputFilePath = path.join(tempDir, outputFileName);
    
    // Trim the video
    await trimVideo(inputFilePath, outputFilePath, startTime, endTime);
    
    // Read the trimmed video
    const trimmedVideoBuffer = await readFile(outputFilePath);
    
    // Return the trimmed video as base64
    return NextResponse.json({
      success: true,
      message: 'Video trimmed successfully',
      trimmedVideo: {
        fileName: outputFileName,
        data: trimmedVideoBuffer.toString('base64'),
        mimeType: 'video/mp4'
      }
    });
    
  } catch (error) {
    console.error('Error trimming video:', error);
    return NextResponse.json({
      success: false,
      message: 'Error trimming video',
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