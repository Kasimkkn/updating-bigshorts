import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudioPlayback = (postItems: any[]) => {
    const [audioMuteStates, setAudioMuteStates] = useState<{ [key: number]: boolean }>({});
    const [audioPlaybackStatus, setAudioPlaybackStatus] = useState<Record<number, boolean>>({});
    const audioRefs = useRef<Array<React.RefObject<HTMLAudioElement>>>(
        postItems.map(() => React.createRef<HTMLAudioElement>())
    );

    const handleAudioMuteToggle = useCallback((postId: number) => {
        setAudioMuteStates(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    }, []);

    useEffect(() => {
        const initialAudioMuteStates = postItems.reduce((acc, post) => {
            acc[post.postId] = true; // Start muted
            return acc;
        }, {} as { [key: number]: boolean });
        setAudioMuteStates(initialAudioMuteStates);
    }, [postItems]);

    useEffect(() => {
        audioRefs.current = postItems.map(() => React.createRef<HTMLAudioElement>());
    }, [postItems]);

    return {
        audioMuteStates,
        audioPlaybackStatus,
        audioRefs,
        handleAudioMuteToggle,
        setAudioPlaybackStatus
    };
};
