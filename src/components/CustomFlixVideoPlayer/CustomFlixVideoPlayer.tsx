import { WatchHistoryItem, fetchMiniWatchHistory } from '@/services/getminiwatchhistory';
import { WatchHistoryRequest, insertWatchHistory } from '@/services/insertwatchhistory';
import React, { useEffect, useRef, useState } from 'react';
import {
    FiChevronLeft,
    FiMaximize,
    FiMinimize,
    FiMoreVertical,
    FiPause,
    FiPlay,
    FiVolume2,
    FiVolumeX
} from 'react-icons/fi';
import { MdPictureInPictureAlt } from 'react-icons/md';
import { TbRewindBackward10, TbRewindForward10 } from 'react-icons/tb';
import ReactPlayer from 'react-player';
import SafeImage from '../shared/SafeImage';

interface CustomVideoPlayerProps {
    src: string;
    onReady?: () => void;
    onPlay?: () => void;
    onHlsLoaded?: () => void;
    onHlsError?: (error: string) => void;
    videoId?: number
}

// Add Hls type if using HLS.js
declare const Hls: any;

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
    src,
    onReady,
    onPlay,
    onHlsLoaded,
    onHlsError,
    videoId
}) => {
    const playerRef = useRef<ReactPlayer>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const hlsInstanceRef = useRef<any>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [quality, setQuality] = useState('auto');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showQualitySettings, setShowQualitySettings] = useState(false);
    const [showPlaybackSettings, setShowPlaybackSettings] = useState(false);
    const [isHlsSupported, setIsHlsSupported] = useState(true);
    const [hlsLoaded, setHlsLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [hlsError, setHlsError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isWatchHistoryLoading, setIsWatchHistoryLoading] = useState<boolean>(false);
    const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
    const initialSeekDoneRef = useRef<boolean>(false);
    const [startPosition, setStartPosition] = useState<number>(0);
    const [lastSavedTime, setLastSavedTime] = useState<number>(0);

    const qualities = ['auto', 'high', 'medium', 'low'];
    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

    // Setup and cleanup HLS.js
    useEffect(() => {
        // Destroy any existing HLS instance when component unmounts
        return () => {
            if (hlsInstanceRef.current) {
                hlsInstanceRef.current.destroy();
                hlsInstanceRef.current = null;
            }
        };
    }, []);

    // Load watch history on initial mount if videoId is provided
    useEffect(() => {
        if (videoId) {
            getMiniWatchHistory();
        }
    }, [videoId]);

    // Process watch history data to find matching video
    useEffect(() => {
        if (watchHistory.length > 0 && videoId) {
            // Find the history item for this video
            const videoHistory = watchHistory.find(item => item.flix_id === videoId);

            if (videoHistory && videoHistory.watch_percentage !== undefined) {
                // Calculate the start position based on percentage
                // Ensure watch_percentage is treated as a number
                const watchPercentage = Number(videoHistory.watch_percentage);
                if (!isNaN(watchPercentage) && watchPercentage > 0) {
                    setStartPosition(watchPercentage / 100);
                }
            }
        }
    }, [watchHistory, videoId]);


    // Apply the start position once we have the duration
    useEffect(() => {
        if (startPosition > 0 && duration > 0 && !initialSeekDoneRef.current && playerRef.current) {
            const timeToStart = startPosition * duration;

            // Don't resume from the very end (e.g., if watch_percentage is 98% or higher)
            if (startPosition < 0.98) {
                playerRef.current.seekTo(startPosition, 'fraction');
                initialSeekDoneRef.current = true;
            } else {
                initialSeekDoneRef.current = true;
            }
        }
    }, [startPosition, duration, playerRef]);
    const getMiniWatchHistory = async () => {
        setIsWatchHistoryLoading(true);
        try {
            const response = await fetchMiniWatchHistory();
            if (response.isSuccess && response.data.history && response.data.history.length > 0) {
                setWatchHistory(response.data.history);
            }
        } catch (error) {
        } finally {
            setIsWatchHistoryLoading(false);
        }
    };

    const updateWatchHistory = async (currentTime: number) => {
        try {
            if (!videoId || Math.floor(currentTime) % 10 !== 0) return;
            if (Math.floor(currentTime) === Math.floor(lastSavedTime)) return;

            const watchPercentage = (currentTime / duration) * 100;

            const watchHistoryData: WatchHistoryRequest = {
                flixId: videoId,
                watchedPosition: currentTime,
                watchPercentage: watchPercentage
            };

            await insertWatchHistory(watchHistoryData);
            setLastSavedTime(currentTime);
        } catch (error) {
            console.error('Failed to update watch history:', error);
        }
    };

    // Log video source changes for debugging
    useEffect(() => {
        // Reset HLS state when source changes
        setHlsLoaded(false);
        setHlsError(null);
        setRetryCount(0);
        // Add this line to the src useEffect
        initialSeekDoneRef.current = false;
        if (hlsInstanceRef.current) {
            hlsInstanceRef.current.destroy();
            hlsInstanceRef.current = null;
        }
    }, [src]);

    // Initialize HLS directly if needed
    useEffect(() => {
        // Skip if no source or HLS is not supported or Hls is not defined
        if (!src || !isHlsSupported || typeof Hls === 'undefined' || !Hls.isSupported()) return;
        // Give ReactPlayer time to create the video element
        const initializeHls = () => {
            // Get the video element from ReactPlayer
            const videoElement = containerRef.current?.querySelector('video');
            if (!videoElement) {
                console.warn("No video element found for HLS initialization, retrying in 100ms");
                setTimeout(initializeHls, 100);
                return;
            }
            videoElementRef.current = videoElement;

            // Create new HLS instance
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                debug: true, // Enable debug logs
                xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                    xhr.addEventListener('error', () => {
                        console.error(`XHR error for: ${url}`);
                    });
                    xhr.addEventListener('timeout', () => {
                        console.error(`XHR timeout for: ${url}`);
                    });
                }
            });

            hlsInstanceRef.current = hls;

            // Load the source
            try {
                hls.loadSource(src);
                hls.attachMedia(videoElement);

                // HLS events
                hls.on(Hls.Events.MANIFEST_PARSED, (_event: any, data: any) => {
                    setHlsLoaded(true);
                    if (onHlsLoaded) onHlsLoaded();
                });

                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                });

                hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
                    console.error("HLS error:", data);
                    const errorMessage = `HLS Error: ${data.type} - ${data.details}`;
                    setHlsError(errorMessage);

                    if (onHlsError) onHlsError(errorMessage);

                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                hlsInstanceRef.current = null;

                                // Try again with a different URL format if under max retries
                                if (retryCount < 3) {
                                    const newCount = retryCount + 1;
                                    setRetryCount(newCount);
                                }
                                break;
                        }
                    }
                });
            } catch (error) {
                console.error("Error initializing HLS:", error);
                if (onHlsError) onHlsError(`Error initializing HLS: ${error}`);
            }
        };

        // Start the initialization process
        initializeHls();
    }, [src, isHlsSupported, retryCount, onHlsLoaded, onHlsError]);

    const getQualityUrl = (quality: string) => {
        // Check if src contains master.m3u8
        if (src.includes('master.m3u8')) {
            let baseUrl = src;
            if (quality === 'auto') {
                return baseUrl;
            }
            if (quality === 'high') {
                return baseUrl.replace('master.m3u8', 'high/index.m3u8');
            }
            if (quality === 'medium') {
                return baseUrl.replace('master.m3u8', 'medium/index.m3u8');
            }
            if (quality === 'low') {
                return baseUrl.replace('master.m3u8', 'low/index.m3u8');
            }
        }

        // If no master.m3u8 in the URL, just return the original source
        return src;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setPlayed(value);
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setSeeking(false);
        if (playerRef.current) {
            const target = e.target as HTMLInputElement;
            playerRef.current.seekTo(parseFloat(target.value));
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setVolume(value);
        setIsMuted(value === 0);
    };

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
    };

    const handleSkip = (seconds: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(playerRef.current.getCurrentTime() + seconds);
        }
    };

    const handleQualityChange = (newQuality: string) => {
        if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            setQuality(newQuality);
            setIsLoading(true);

            setTimeout(() => {
                if (playerRef.current) {
                    playerRef.current.seekTo(currentTime);
                }
            }, 500);
        }

        setShowQualitySettings(false);
        setShowSettings(false);
    };

    const handlePlaybackRateChange = (rate: number) => {
        setPlaybackRate(rate);
        setShowPlaybackSettings(false);
        setShowSettings(false);
    };

    const togglePiP = async () => {
        try {
            const video = document.querySelector('video');
            if (!video) return;

            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();

            } else {
                await video.requestPictureInPicture();
            }
        } catch (err) {
            console.error('PiP error:', err);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    };

    const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
        if (!seeking) {
            setPlayed(state.played);
            if (isPlaying) {
                updateWatchHistory(state.playedSeconds);
            }
        }
    };

    const handleReady = () => {
        setIsLoading(false);

        // Check HLS support
        if (typeof Hls !== 'undefined') {
            const hlsSupported = Hls.isSupported();
            setIsHlsSupported(hlsSupported);
        }

        // Get video element after ReactPlayer is ready
        const videoElement = containerRef.current?.querySelector('video');
        if (videoElement) {
            videoElementRef.current = videoElement;
        }

        // Trigger the provided onReady callback
        if (onReady) {
            onReady();
        }
    };

    const handleBuffer = () => {
        setIsBuffering(true);
    };

    const handleBufferEnd = () => {
        setIsBuffering(false);
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
    };

    const handleError = (error: any) => {
        console.error('Video error:', error);
        setIsLoading(false);
    };

    const handleMouseMove = () => {
        setShowControls(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
                setShowSettings(false);
                setShowQualitySettings(false);
                setShowPlaybackSettings(false);
            }, 3000);
        }
    };

    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }

            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }

            if (document.pictureInPictureElement) {
                document.exitPictureInPicture().catch(err => {
                    console.error('Failed to exit PiP mode:', err);
                });
            }
        };
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-bg-color overflow-hidden rounded-md"
            onMouseMove={handleMouseMove}
            onClick={() => {
                if (!showSettings && !showQualitySettings && !showPlaybackSettings) {
                    handlePlayPause();
                }
            }}
        >
            <ReactPlayer
                ref={playerRef}
                url={getQualityUrl(quality)}
                width="100%"
                height="100%"
                playing={isPlaying}
                volume={isMuted ? 0 : volume}
                playbackRate={playbackRate}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onReady={handleReady}
                onBuffer={handleBuffer}
                onBufferEnd={handleBufferEnd}
                onPlay={() => {
                    setIsPlaying(true);
                    if (onPlay) onPlay();
                }}
                onError={handleError}
                className="bg-black rounded-md"
                progressInterval={100}
                style={{ position: 'absolute', top: 0, left: 0, borderRadius: '8px' }}
                config={{
                    file: {
                        attributes: {
                            crossOrigin: "anonymous"
                        }
                    }
                }}
            />

            {(isLoading || isBuffering) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 pointer-events-auto">
                    <SafeImage
                        src={src.replaceAll('/hls/master.m3u8', '/Thumbnail.jpg.webp')}
                        alt="Loading"
                        className="absolute inset-0 w-full h-full object-cover rounded shadow-lg"
                    />
                </div>
            )}

            {/* Play/Pause overlay (center icon) */}
            {!showControls && (
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-bg-color bg-opacity-40 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPause();
                    }}
                >
                    {isPlaying ? (
                        <FiPause className="text-primary-text-color" size={30} />
                    ) : (
                        <FiPlay className="text-primary-text-color" size={30} />
                    )}
                </div>
            )}

            <div className='md:hidden absolute top-0 left-0 w-full h-max flex justify-between p-2'>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={toggleFullscreen}
                        className="text-white transition-colors"
                    >
                        {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
                    </button>
                    <button
                        onClick={togglePiP}
                        className="text-white transition-colors"
                        title="Picture-in-Picture"
                    >
                        <MdPictureInPictureAlt size={18} />
                    </button>
                </div>
                <div className='flex items-center gap-2'>
                    <div className="md:hidden flex items-center space-x-2 group relative">
                        <button
                            onClick={handleToggleMute}
                            className="text-white transition-colors"
                        >
                            {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                        </button>
                        <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300">
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-16 h-1 bg-secondary-bg-color rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-bg-color"
                            />
                        </div>
                    </div>
                    <div className="relative flex">
                        <button
                            onClick={() => {
                                setShowSettings(!showSettings);
                                setShowQualitySettings(false);
                                setShowPlaybackSettings(false);
                            }}
                            className={`text-white transition-colors ${showSettings ? 'text-purple-400' : ''} `}
                        >
                            <FiMoreVertical size={18} />
                        </button>

                        {showSettings && (
                            <div className="absolute top-4 right-4 w-48 bg-bg-color bg-opacity-90 rounded-md shadow-lg p-2 text-sm">
                                {!showQualitySettings && !showPlaybackSettings && (
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => {
                                                setShowPlaybackSettings(true);
                                            }}
                                            className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded"
                                        >
                                            <span>Playback Speed</span>
                                            <span>{playbackRate}x</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowQualitySettings(true);
                                            }}
                                            className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded"
                                        >
                                            <span>Quality</span>
                                            <span>{quality}</span>
                                        </button>
                                    </div>
                                )}

                                {showQualitySettings && (
                                    <div className="space-y-1">
                                        <div className="flex items-center px-2 py-1">
                                            <button
                                                onClick={() => setShowQualitySettings(false)}
                                                className="mr-2 text-white"
                                            >
                                                <FiChevronLeft size={16} />
                                            </button>
                                            <span>Quality</span>
                                        </div>
                                        <div className="px-1">
                                            {qualities.map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => handleQualityChange(q)}
                                                    className={`flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded ${quality === q ? 'bg-secondary-bg-color' : ''
                                                        }`}
                                                >
                                                    <span>{q}</span>
                                                    {quality === q && (
                                                        <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showPlaybackSettings && (
                                    <div className="space-y-1">
                                        <div className="flex items-center px-2 py-1">
                                            <button
                                                onClick={() => setShowPlaybackSettings(false)}
                                                className="mr-2 text-white"
                                            >
                                                <FiChevronLeft size={16} />
                                            </button>
                                            <span>Playback Speed</span>
                                        </div>
                                        <div className="px-1">
                                            {playbackRates.map(rate => (
                                                <button
                                                    key={rate}
                                                    onClick={() => handlePlaybackRateChange(rate)}
                                                    className={`flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded ${playbackRate === rate ? 'bg-secondary-bg-color' : ''
                                                        }`}
                                                >
                                                    <span>{rate}x</span>
                                                    {playbackRate === rate && (
                                                        <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-1">
                    <input
                        type="range"
                        min={0}
                        max={0.999999}
                        step="any"
                        value={played}
                        onMouseDown={handleSeekMouseDown}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekMouseUp}
                        className="w-full h-1 bg-secondary-bg-color rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-bg-color"
                    />
                </div>

                <div className="flex items-center justify-between text-primary-text-color">
                    <div className="flex items-center space-x-4 max-md:w-full max-md:justify-between">
                        <button
                            onClick={() => handleSkip(-10)}
                            className="text-white transition-colors flex items-center"
                        >
                            <TbRewindBackward10 size={20} />
                        </button>

                        <button
                            onClick={handlePlayPause}
                            className="text-white transition-colors"
                        >
                            {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                        </button>
                        <button
                            onClick={() => handleSkip(10)}
                            className="text-white transition-colors flex items-center"
                        >
                            <TbRewindForward10 size={20} />
                        </button>

                        <div className="max-md:hidden flex items-center space-x-2 group relative">
                            <button
                                onClick={handleToggleMute}
                                className="text-white transition-colors"
                            >
                                {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300">
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step="any"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-16 h-1 bg-secondary-bg-color rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-bg-color"
                                />
                            </div>
                        </div>

                        <div className="text-sm text-white">
                            {formatTime(played * duration)} / {formatTime(duration)}
                        </div>
                    </div>

                    <div className="max-md:hidden flex items-center space-x-4">
                        <button
                            onClick={togglePiP}
                            className="text-white transition-colors"
                            title="Picture-in-Picture"
                        >
                            <MdPictureInPictureAlt size={18} />
                        </button>

                        <div className="relative flex">
                            <button
                                onClick={() => {
                                    setShowSettings(!showSettings);
                                    setShowQualitySettings(false);
                                    setShowPlaybackSettings(false);
                                }}
                                className={`text-white transition-colors ${showSettings ? 'text-purple-400' : ''} `}
                            >
                                <FiMoreVertical size={18} />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 w-44 bg-bg-color bg-opacity-90 rounded-md shadow-lg p-2 text-sm">
                                    {!showQualitySettings && !showPlaybackSettings && (
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => {
                                                    setShowPlaybackSettings(true);
                                                }}
                                                className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded"
                                            >
                                                <span>Playback Speed</span>
                                                <span>{playbackRate}x</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowQualitySettings(true);
                                                }}
                                                className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded"
                                            >
                                                <span>Quality</span>
                                                <span>{quality}</span>
                                            </button>
                                        </div>
                                    )}

                                    {showQualitySettings && (
                                        <div className="space-y-1">
                                            <div className="flex items-center px-2 py-1">
                                                <button
                                                    onClick={() => setShowQualitySettings(false)}
                                                    className="mr-2 text-white"
                                                >
                                                    <FiChevronLeft size={16} />
                                                </button>
                                                <span>Quality</span>
                                            </div>
                                            <div className="px-1">
                                                {qualities.map(q => (
                                                    <button
                                                        key={q}
                                                        onClick={() => handleQualityChange(q)}
                                                        className={`flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded ${quality === q ? 'bg-secondary-bg-color' : ''
                                                            }`}
                                                    >
                                                        <span>{q}</span>
                                                        {quality === q && (
                                                            <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {showPlaybackSettings && (
                                        <div className="space-y-1">
                                            <div className="flex items-center px-2 py-1">
                                                <button
                                                    onClick={() => setShowPlaybackSettings(false)}
                                                    className="mr-2 text-white"
                                                >
                                                    <FiChevronLeft size={16} />
                                                </button>
                                                <span>Playback Speed</span>
                                            </div>
                                            <div className="px-1">
                                                {playbackRates.map(rate => (
                                                    <button
                                                        key={rate}
                                                        onClick={() => handlePlaybackRateChange(rate)}
                                                        className={`flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded ${playbackRate === rate ? 'bg-secondary-bg-color' : ''
                                                            }`}
                                                    >
                                                        <span>{rate}x</span>
                                                        {playbackRate === rate && (
                                                            <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="text-white transition-colors"
                        >
                            {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;