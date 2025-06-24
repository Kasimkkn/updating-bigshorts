import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';

export const useVideoPlayback = (postItems: any[]) => {
    const [videoMuteStates, setVideoMuteStates] = useState<{ [key: number]: boolean }>({});
    const [visiblePosts, setVisiblePosts] = useState<Set<number>>(new Set());
    const [videoPlaybackStatus, setVideoPlaybackStatus] = useState<Record<number, boolean>>({});
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
    const videoDivRefs = useRef<Array<React.RefObject<HTMLDivElement>>>(
        postItems.map(() => React.createRef<HTMLDivElement>())
    );
    const observerRef = useRef<IntersectionObserver | null>(null);

    const handleMuteToggle = useCallback((postId: number) => {
        setVideoMuteStates(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    }, []);

    useEffect(() => {
        const initialMuteStates = postItems.reduce((acc, post) => {
            acc[post.postId] = true;
            return acc;
        }, {} as { [key: number]: boolean });
        setVideoMuteStates(initialMuteStates);
    }, [postItems]);

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        videoDivRefs.current = postItems.map(() => React.createRef<HTMLDivElement>());

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const index = parseInt(entry.target.getAttribute('data-index')!);
                if (!postItems[index]) return;

                setVisiblePosts(prev => {
                    const updated = new Set(prev);
                    if (entry.isIntersecting) {
                        updated.add(index);
                    } else {
                        updated.delete(index);
                    }
                    return updated;
                });
            });
        }, {
            threshold: 0.6,
            rootMargin: '0px',
        });

        observerRef.current = observer;

        const attachObserverTimeout = setTimeout(() => {
            videoDivRefs.current.forEach((ref, idx) => {
                if (ref.current) {
                    observer.observe(ref.current);
                }
            });
        }, 300);

        return () => {
            clearTimeout(attachObserverTimeout);
            observer.disconnect();
        };
    }, [postItems]);

    useEffect(() => {
        const timer = setTimeout(() => {
            let topVisibleIndex: number | null = null;
            for (const index of Array.from(visiblePosts)) {
                if (topVisibleIndex === null || index < topVisibleIndex) {
                    topVisibleIndex = index;
                }
            }

            if (topVisibleIndex !== activeVideoIndex) {
                setActiveVideoIndex(topVisibleIndex);
            }

            const newStatus: Record<number, boolean> = {};
            postItems.forEach((post, index) => {
                newStatus[post.postId] = index === topVisibleIndex;
            });
            setVideoPlaybackStatus(newStatus);
        }, 500);

        return () => clearTimeout(timer);
    }, [visiblePosts, postItems, activeVideoIndex]);

    return {
        videoMuteStates,
        videoPlaybackStatus,
        activeVideoIndex,
        videoDivRefs,
        handleMuteToggle,
        visiblePosts
    };
};
