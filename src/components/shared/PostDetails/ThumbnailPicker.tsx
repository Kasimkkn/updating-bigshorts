import React, { useEffect, useRef, useState } from 'react'
import { IoClose } from 'react-icons/io5';
import Button from '../Button';
import Input from '../Input';

interface ThumbnailPickerProps {
    setThumbnail: React.Dispatch<React.SetStateAction<string>>
    onClose: () => void;
    videoUrl: string
    isFor?: "flix" | "snip"
    defaultThumbnail?: string
}

const ThumbnailPicker: React.FC<ThumbnailPickerProps> = ({ setThumbnail, onClose, videoUrl, isFor = "flix", defaultThumbnail }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const isCrossOriginUrl = videoUrl.startsWith('https://')

    const formatTime = (timeInSeconds: number): string => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (defaultThumbnail && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = new Image();
                img.onload = () => {
                    // Set canvas dimensions to match the default aspect ratio
                    canvas.width = isFor === "flix" ? 640 : 360;
                    canvas.height = isFor === "flix" ? 360 : 640;
                    
                    // Draw the image on the canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = defaultThumbnail;
                
                // Handle loading errors
                img.onerror = () => {
                    console.error("Failed to load default image");
                };
            }
        }
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleMetadataLoaded = () => {
            setDuration(video.duration);
            // Capture first frame
            captureFrame();
        };

        video.addEventListener('loadedmetadata', handleMetadataLoaded);

        return () => {
            video.removeEventListener('loadedmetadata', handleMetadataLoaded);
        };
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            captureFrame();
        };

        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    const captureFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            captureFrame();
        }
    };

    // Toggle play/pause
    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Capture and set thumbnail
    const handleCaptureThumbnail = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Convert canvas to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
        setThumbnail(thumbnailDataUrl);
        onClose();
    };

    // Handle file upload
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                // Set the uploaded image
                setUploadedImage(event.target.result as string);

                // Draw the image on the canvas
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const img = new Image();
                        img.onload = () => {
                            // Set canvas dimensions to match the image
                            canvas.width = img.width;
                            canvas.height = img.height;

                            // Draw the image on the canvas
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        };
                        img.src = event.target.result as string;
                    }
                }

                // If video is playing, pause it
                if (isPlaying) {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-bg-color bg-opacity-50 z-50 text-text-color">
            <div className="bg-primary-bg-color rounded-lg p-6 w-[90%] max-w-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Add Thumbnail</h3>
                    <button
                        className="p-1 rounded-full hover:bg-secondary-bg-color bg-bg-color transition-colors"
                        onClick={onClose}
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">

                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* Canvas to display the current frame */}
                    <div className="flex justify-center">
                        <div className={`relative ${isFor === "flix" ? 'w-full aspect-[16/9]' : 'h-[500px] aspect-[9/16]'}`}> {/* 16:9 and 9:16 aspect ratio */}
                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full object-contain bg-bg-color rounded-md"
                            />
                        </div>
                    </div>

                    {/* Video controls */}
                    {!isCrossOriginUrl && <div className="flex items-center gap-2">
                        {/* Hidden video element for frame extraction */}
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className="hidden"
                            preload="metadata"
                            onEnded={() => setIsPlaying(false)}
                        />
                        <Button
                            onClick={togglePlayPause}
                            isLinearBorder={true}
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </Button>

                        <span className="text-sm">{formatTime(currentTime)}</span>

                        <Input
                            className="flex-grow mx-2"
                            type="range"
                            min="0"
                            max={duration}
                            step="0.1"
                            value={currentTime}
                            onChange={handleTimeChange}
                        />

                        <span className="text-sm">{formatTime(duration)}</span>
                    </div>}
                </div>

                <div className="flex justify-end mt-6 gap-2">
                    <Button
                        onClick={handleUploadClick}
                        isLinearBtn={true}
                    >
                        Upload from device
                    </Button>
                    <Button
                        onClick={handleCaptureThumbnail}
                        isLinearBtn={true}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ThumbnailPicker