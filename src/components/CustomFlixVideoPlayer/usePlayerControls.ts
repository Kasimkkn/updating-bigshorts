import { useEffect } from 'react';

export const usePlayerControls = ({
    containerRef,
    controlsTimeoutRef,
    isPlaying,
    setShowControls,
    setShowSettings,
    setShowQualitySettings,
    setShowPlaybackSettings,
    setIsFullscreen
}: {
    containerRef: React.RefObject<HTMLDivElement>,
    controlsTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    isPlaying: boolean,
    setShowControls: (show: boolean) => void,
    setShowSettings: (show: boolean) => void,
    setShowQualitySettings: (show: boolean) => void,
    setShowPlaybackSettings: (show: boolean) => void,
    setIsFullscreen: (fullscreen: boolean) => void
}) => {
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
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

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

    return { handleMouseMove };
};
