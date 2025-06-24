import { useEffect, useRef, useCallback } from 'react';

interface UseStoryTimerProps {
    duration: number;
    isTimerPaused: boolean;
    isAnalyticsOpen: boolean;
    onNext: () => void;
}

export const useStoryTimer = ({ duration, isTimerPaused, isAnalyticsOpen, onNext }: UseStoryTimerProps) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (!isTimerPaused && !isAnalyticsOpen) {
            timerRef.current = setTimeout(() => {
                onNext();
            }, duration * 1000);
        }
    }, [duration, isTimerPaused, isAnalyticsOpen, onNext]);

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [startTimer]);

    return { startTimer };
};
