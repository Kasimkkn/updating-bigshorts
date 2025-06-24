import { useEffect } from 'react';
import { fetchMiniWatchHistory } from '@/services/getminiwatchhistory';
import { WatchHistoryRequest, insertWatchHistory } from '@/services/insertwatchhistory';

export const useWatchHistory = (
    videoId: number | undefined,
    setIsWatchHistoryLoading: (loading: boolean) => void,
    setWatchHistory: (history: any[]) => void,
    startPosition: number,
    setStartPosition: (position: number) => void,
    watchHistory: any[],
    duration: number,
    initialSeekDoneRef: React.MutableRefObject<boolean>,
    playerRef: React.RefObject<any>,
    lastSavedTime: number,
    setLastSavedTime: (time: number) => void
) => {
    const getMiniWatchHistory = async () => {
        if (!videoId) return;
        setIsWatchHistoryLoading(true);
        try {
            const response = await fetchMiniWatchHistory();
            if (response.isSuccess && response.data.history?.length > 0) {
                setWatchHistory(response.data.history);
            }
        } catch (error) {
            console.error('Failed to fetch watch history:', error);
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

    // Load watch history on mount
    useEffect(() => {
        if (videoId) getMiniWatchHistory();
    }, [videoId]);

    // Process watch history to set start position
    useEffect(() => {
        if (watchHistory.length > 0 && videoId) {
            const videoHistory = watchHistory.find(item => item.flix_id === videoId);
            if (videoHistory?.watch_percentage !== undefined) {
                const watchPercentage = Number(videoHistory.watch_percentage);
                if (!isNaN(watchPercentage) && watchPercentage > 0) {
                    setStartPosition(watchPercentage / 100);
                }
            }
        }
    }, [watchHistory, videoId]);

    // Apply start position when duration is available
    useEffect(() => {
        if (startPosition > 0 && duration > 0 && !initialSeekDoneRef.current && playerRef.current) {
            if (startPosition < 0.98) {
                playerRef.current.seekTo(startPosition, 'fraction');
            }
            initialSeekDoneRef.current = true;
        }
    }, [startPosition, duration]);

    return { updateWatchHistory };
};
