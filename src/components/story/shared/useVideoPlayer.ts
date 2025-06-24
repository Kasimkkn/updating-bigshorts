import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVideoPlayerProps {
    interactiveVideo?: string;
    currentStoryIndex: number;
    currentUserIndex: number;
}

export const useVideoPlayer = ({ interactiveVideo, currentStoryIndex, currentUserIndex }: UseVideoPlayerProps) => {
    const [videoUrl, setVideoUrl] = useState("");
    const [videoReady, setVideoReady] = useState(false);
    const [forceReload, setForceReload] = useState(0);
    const [videoLoading, setVideoLoading] = useState(false);
    const videoLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const extractVideoUrl = useCallback(() => {
        if (!interactiveVideo) return "";

        try {
            const interactiveVideoArray = JSON.parse(interactiveVideo);
            const rawVideoPath = interactiveVideoArray[0]?.path || "";
            return rawVideoPath.replace('https://d1332u4stxguh3.cloudfront.net/', '/video/');
        } catch (error) {
            console.error("Error parsing interactiveVideo JSON:", error);
            return "";
        }
    }, [interactiveVideo]);

    useEffect(() => {
        setVideoReady(false);
        const newVideoUrl = extractVideoUrl();
        setVideoUrl(newVideoUrl);

        if (newVideoUrl) {
            videoLoadingTimeoutRef.current = setTimeout(() => {
                setForceReload(prev => prev + 1);
            }, 100);
        }

        return () => {
            if (videoLoadingTimeoutRef.current) {
                clearTimeout(videoLoadingTimeoutRef.current);
            }
        };
    }, [currentUserIndex, currentStoryIndex, extractVideoUrl]);

    return {
        videoUrl,
        videoReady,
        setVideoReady,
        forceReload,
        videoLoading,
        setVideoLoading
    };
};