import React from 'react';
import { FiMaximize, FiMinimize, FiPause, FiPlay } from 'react-icons/fi';
import { MdPictureInPictureAlt } from 'react-icons/md';
import ReactPlayer from 'react-player';
import SafeImage from '../shared/SafeImage';
import { useHLS } from './useHLS';
import { usePlayerControls } from './usePlayerControls';
import { useVideoPlayer } from './useVideoPlayer';
import { useWatchHistory } from './useWatchHistory';
import { MobileControls } from './VideoControls/MobileControls';
import { PlaybackControls } from './VideoControls/PlaybackControls';
import { ProgressBar } from './VideoControls/ProgressBar';
import { SettingsMenu } from './VideoControls/SettingsMenu';
import { VolumeControl } from './VideoControls/VolumeControl';
import { formatTime, getQualityUrl } from './videoUtils';

declare const Hls: any;

interface CustomVideoPlayerProps {
    src: string;
    onReady?: () => void;
    onPlay?: () => void;
    onHlsLoaded?: () => void;
    onHlsError?: (error: string) => void;
    videoId?: number;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
    src,
    onReady,
    onPlay,
    onHlsLoaded,
    onHlsError,
    videoId
}) => {
    const playerState = useVideoPlayer(src, videoId);
    const {
        playerRef, containerRef, controlsTimeoutRef, videoElementRef, hlsInstanceRef, initialSeekDoneRef,
        isPlaying, setIsPlaying, volume, setVolume, isMuted, setIsMuted, played, setPlayed,
        seeking, setSeeking, duration, setDuration, playbackRate, setPlaybackRate,
        quality, setQuality, isFullscreen, setIsFullscreen, showControls, setShowControls,
        isLoading, setIsLoading, isBuffering, setIsBuffering,
        showSettings, setShowSettings, showQualitySettings, setShowQualitySettings,
        showPlaybackSettings, setShowPlaybackSettings,
        isHlsSupported, setIsHlsSupported, setHlsLoaded, retryCount, setRetryCount,
        setHlsError, setIsWatchHistoryLoading,
        watchHistory, setWatchHistory, startPosition, setStartPosition, lastSavedTime, setLastSavedTime,
        qualities, playbackRates
    } = playerState;

    const { updateWatchHistory } = useWatchHistory(
        videoId, setIsWatchHistoryLoading, setWatchHistory, startPosition, setStartPosition,
        watchHistory, duration, initialSeekDoneRef, playerRef, lastSavedTime, setLastSavedTime,
    );

    useHLS(
        {
            src, isHlsSupported, containerRef, videoElementRef, hlsInstanceRef,
            setHlsLoaded, setHlsError, setRetryCount, retryCount, initialSeekDoneRef, onHlsLoaded, onHlsError,
        });

    const { handleMouseMove } = usePlayerControls({
        containerRef, controlsTimeoutRef, isPlaying, setShowControls,
        setShowSettings, setShowQualitySettings, setShowPlaybackSettings, setIsFullscreen
    });

    // Event handlers
    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => setPlayed(parseFloat(e.target.value));
    const handleSeekMouseDown = () => setSeeking(true);
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
    const handleToggleMute = () => setIsMuted(!isMuted);
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
        if (typeof Hls !== 'undefined') {
            const hlsSupported = Hls.isSupported();
            setIsHlsSupported(hlsSupported);
        }
        const videoElement = containerRef.current?.querySelector('video');
        if (videoElement) {
            videoElementRef.current = videoElement;
        }
        onReady?.();
    };

    const handleBuffer = () => setIsBuffering(true);
    const handleBufferEnd = () => setIsBuffering(false);
    const handleDuration = (duration: number) => setDuration(duration);
    const handleError = (error: any) => {
        console.error('Video error:', error);
        setIsLoading(false);
    };

    // Props for child components
    const volumeProps = {
        isMuted,
        volume,
        onToggleMute: handleToggleMute,
        onVolumeChange: handleVolumeChange
    };

    const settingsProps = {
        showSettings,
        showQualitySettings,
        showPlaybackSettings,
        quality,
        playbackRate,
        qualities,
        playbackRates,
        onToggleSettings: () => {
            setShowSettings(!showSettings);
            setShowQualitySettings(false);
            setShowPlaybackSettings(false);
        },
        onShowQualitySettings: () => setShowQualitySettings(true),
        onShowPlaybackSettings: () => setShowPlaybackSettings(true),
        onQualityChange: handleQualityChange,
        onPlaybackRateChange: handlePlaybackRateChange,
        onBack: () => {
            setShowQualitySettings(false);
            setShowPlaybackSettings(false);
        }
    };

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
                url={getQualityUrl(src, quality)}
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
                    onPlay?.();
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

            {/* Mobile Controls */}
            <MobileControls
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                onTogglePiP={togglePiP}
                volumeProps={volumeProps}
                settingsProps={settingsProps}
            />

            {/* Bottom Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <ProgressBar
                    played={played}
                    onSeekMouseDown={handleSeekMouseDown}
                    onSeekChange={handleSeekChange}
                    onSeekMouseUp={handleSeekMouseUp}
                />

                <div className="flex items-center justify-between text-primary-text-color">
                    <div className="flex items-center space-x-4 max-md:w-full max-md:justify-between">
                        <PlaybackControls
                            isPlaying={isPlaying}
                            onPlayPause={handlePlayPause}
                            onSkip={handleSkip}
                        />

                        <VolumeControl {...volumeProps} />

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

                        <SettingsMenu {...settingsProps} />

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
}; export default CustomVideoPlayer;
