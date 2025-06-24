import { WatchHistoryItem } from '@/services/getminiwatchhistory';
import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';

export const useVideoPlayer = (src: string, videoId?: number) => {
    const playerRef = useRef<ReactPlayer>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const hlsInstanceRef = useRef<any>(null);
    const initialSeekDoneRef = useRef<boolean>(false);

    // Player state
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
    const [isLoading, setIsLoading] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    // Settings state
    const [showSettings, setShowSettings] = useState(false);
    const [showQualitySettings, setShowQualitySettings] = useState(false);
    const [showPlaybackSettings, setShowPlaybackSettings] = useState(false);

    // HLS state
    const [isHlsSupported, setIsHlsSupported] = useState(true);
    const [hlsLoaded, setHlsLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [hlsError, setHlsError] = useState<string | null>(null);

    // Watch history state
    const [isWatchHistoryLoading, setIsWatchHistoryLoading] = useState<boolean>(false);
    const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
    const [startPosition, setStartPosition] = useState<number>(0);
    const [lastSavedTime, setLastSavedTime] = useState<number>(0);

    const qualities = ['auto', 'high', 'medium', 'low'];
    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

    return {
        // Refs
        playerRef, containerRef, controlsTimeoutRef, videoElementRef, hlsInstanceRef, initialSeekDoneRef,
        // Player state
        isPlaying, setIsPlaying, volume, setVolume, isMuted, setIsMuted, played, setPlayed,
        seeking, setSeeking, duration, setDuration, playbackRate, setPlaybackRate,
        quality, setQuality, isFullscreen, setIsFullscreen, showControls, setShowControls,
        isLoading, setIsLoading, isBuffering, setIsBuffering,
        // Settings state
        showSettings, setShowSettings, showQualitySettings, setShowQualitySettings,
        showPlaybackSettings, setShowPlaybackSettings,
        // HLS state
        isHlsSupported, setIsHlsSupported, hlsLoaded, setHlsLoaded, retryCount, setRetryCount,
        hlsError, setHlsError,
        // Watch history state
        isWatchHistoryLoading, setIsWatchHistoryLoading, watchHistory, setWatchHistory,
        startPosition, setStartPosition, lastSavedTime, setLastSavedTime,
        // Constants
        qualities, playbackRates
    };
};
