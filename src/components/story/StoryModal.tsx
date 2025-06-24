'use client';
import { StoryData } from '@/types/storyTypes';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useSwipeable } from 'react-swipeable';
import StoryCard from './StoryCard';
import StoryQueue from './StoryQueue';
import Image from 'next/image';
import mainLogo from '@/assets/mainLogo.svg';

interface StoryModalProps {
    storyData: StoryData[];
    initialUserIndex: number;
    initialStoryIndex: number;
    onClose: () => void;
    removeStory: (storyId: number, userId: number) => void;
    readStory: (storyId: number, userId: number) => void;
    onReactionUpdate: (storyId: number, reaction: string) => void;
    onMuteUpdate: (userId: number, isMuted: number) => void;
}

const StoryModal: React.FC<StoryModalProps> = ({
    storyData,
    initialUserIndex,
    initialStoryIndex,
    onClose,
    removeStory,
    readStory,
    onReactionUpdate,
    onMuteUpdate
}) => {
    // Always initialize all state hooks at the top level
    const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
    const [isMuted, setIsMuted] = useState(false);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [handleNextCall, setHandleNextCall] = useState(false);
    const [duration, setDuration] = useState(15);
    const [timer, setTimer] = useState(15);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const currentUserIndexRef = useRef(currentUserIndex);
    const currentStoryIndexRef = useRef(currentStoryIndex);

    // Safely access currentUser and currentStory
    const currentUser = storyData[currentUserIndex] || null;
    const currentStory = currentUser;

    // Wrap handleNext with useCallback
    const handleNext = useCallback(() => {

        if (isAnalyticsOpen) return;

        if (!currentUser || !currentStory) {
            onClose();
            return;
        }

        if (currentStoryIndex < (currentUser.stories?.length || 0) - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentUserIndex < storyData.length - 1) {
            setCurrentUserIndex(currentUserIndex + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }

    }, [isAnalyticsOpen, currentUser, currentStory, currentStoryIndex, currentUserIndex, storyData.length, onClose]);

    // Wrap handlePrevious with useCallback
    const handlePrevious = useCallback(() => {
        if (isAnalyticsOpen) return;

        if (!currentUser || !currentStory) {
            onClose();
            return;
        }

        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        } else if (currentUserIndex > 0) {
            setCurrentUserIndex(currentUserIndex - 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }
    }, [isAnalyticsOpen, currentUser, currentStory, currentStoryIndex, currentUserIndex, onClose]);

    const handleSwipeLeft = useCallback(() => handleNext(), [handleNext]);
    const handleSwipeRight = useCallback(() => handlePrevious(), [handlePrevious]);

    const handlers = useSwipeable({
        onSwipedLeft: handleSwipeLeft,
        onSwipedRight: handleSwipeRight,
        onSwipedDown: onClose,
        trackMouse: true,
    });

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleNext();
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                handlePrevious();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleNext, handlePrevious, onClose]);
    const handleAnalyticsStateChange = (isOpen: boolean) => {
        setIsAnalyticsOpen(isOpen);
    };

    // Update duration and timer based on current story after initial render
    useEffect(() => {
        if (currentUser && currentStory?.stories?.[currentStoryIndex]) {
            const audioDuration = parseInt(currentStory.stories[currentStoryIndex]?.audioDuration) || 15;
            setDuration(audioDuration);
            setTimer(audioDuration);
        }
    }, [currentUserIndex, currentStoryIndex, storyData, currentUser, currentStory]);

    // Handle next call
    useEffect(() => {

        if (handleNextCall) {
            handleNext();
            setHandleNextCall(false);
        }
    }, [handleNextCall, handleNext]);

    // Timer logic
    useEffect(() => {
        if (!currentUser || !currentStory) return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Set duration only when index changes
        if (currentUserIndexRef.current !== currentUserIndex ||
            currentStoryIndexRef.current !== currentStoryIndex) {

            if (currentStory.stories?.[currentStoryIndex]) {
                const audioDuration = parseInt(currentStory.stories[currentStoryIndex]?.audioDuration) || 15;
                setDuration(audioDuration);
                setTimer(audioDuration);
            }
        }

        // Reset handleNextCall
        setHandleNextCall(false);

        // Update refs
        currentUserIndexRef.current = currentUserIndex;
        currentStoryIndexRef.current = currentStoryIndex;

        if (!isTimerPaused && !isAnalyticsOpen) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 0) {
                        setHandleNextCall(true);
                        return duration;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentStoryIndex, currentUserIndex, isTimerPaused, isAnalyticsOpen, duration, currentUser, currentStory]);
    // Loading state
    if (!currentUser || !currentStory) {
        return (
            <div className="fixed inset-0 bg-bg-color/10 backdrop-blur-sm flex items-center justify-center z-40">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div {...handlers} className="fixed inset-0 bg-bg-color/10 backdrop-blur-sm flex items-center justify-center z-40">
            {/* Close button - responsive */}
            <button
                onClick={onClose}
                className="hidden md:block absolute z-50 top-2 right-2
    text-text-color bg-secondary-bg-color opacity-70 rounded-full h-max w-max
    p-2"
            >
                <IoClose size={24} className="w-7 h-7" />
            </button>

            <div className="max-md:hidden absolute top-5 left-4 z-50 flex items-center 
                    max-sm:top-6 max-sm:left-6 sm:top-5 sm:left-4">
                <div className="w-6 h-6 md:w-7 md:h-7 max-sm:w-8 max-sm:h-8 relative">
                    <img
                        src={mainLogo.src}
                        alt="BigShorts Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
                <span className="ml-2 text-white font-semibold 
                         text-lg md:text-xl 
                         max-sm:text-xl max-sm:ml-3">
                    BigShorts
                </span>
            </div>

            {/* Background overlay */}
            <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm"></div>

            {/* Main content container - responsive layout */}
            <div className="flex items-center w-full justify-center 
                    gap-10 max-lg:gap-6 max-md:gap-2 max-sm:gap-0
                    overflow-hidden h-full 
                    md:px-4 pb-10 md:py-8 
                    max-sm:px-2 max-sm:pb-6 max-sm:py-4">

                {/* Left queue card - hide on small screens */}
                {currentUserIndex > 0 && storyData[currentUserIndex - 1]?.stories?.length > 0 ? (
                    <div className="max-lg:hidden">
                        <StoryQueue
                            coverFile={storyData[currentUserIndex - 1].stories[0].coverFile}
                            profileImage={storyData[currentUserIndex - 1].userProfileImage}
                            userName={storyData[currentUserIndex - 1].userName}
                            userFullName={storyData[currentUserIndex - 1].userFullName}
                            uploadTime={storyData[currentUserIndex - 1].stories[0].scheduleTime}
                        />
                    </div>
                ) : (
                    <div className="w-[250px] h-[60vh] opacity-0 max-lg:hidden"></div>
                )}

                {/* Center story card - responsive */}
                <div className="flex-shrink-0 
                        max-sm:w-full max-sm:flex max-sm:justify-center">
                    <StoryCard
                        story={currentStory}
                        isCenter={true}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        isMuted={isMuted}
                        onToggleMute={() => setIsMuted((prev) => !prev)}
                        onMute={onMuteUpdate}
                        onMuteUpdate={onMuteUpdate}
                        setIsTimerPaused={setIsTimerPaused}
                        onAnalyticsStateChange={handleAnalyticsStateChange}
                        removeStory={removeStory}
                        readStory={readStory}
                        subStoryIndex={currentStoryIndex}
                        isTimerPaused={isTimerPaused}
                        duration={duration}
                        currentUserIndex={currentUserIndex}
                        onReactionUpdate={onReactionUpdate}
                        onCloseSsup={onClose}
                    />
                </div>

                {/* Right queue card - hide on small screens */}
                {currentUserIndex < storyData.length - 1 && storyData[currentUserIndex + 1]?.stories?.length > 0 ? (
                    <div className="max-lg:hidden">
                        <StoryQueue
                            coverFile={storyData[currentUserIndex + 1].stories[0].coverFile}
                            profileImage={storyData[currentUserIndex + 1].userProfileImage}
                            userName={storyData[currentUserIndex + 1].userName}
                            userFullName={storyData[currentUserIndex + 1].userFullName}
                            uploadTime={storyData[currentUserIndex + 1].stories[0].scheduleTime}
                        />
                    </div>
                ) : (
                    <div className="w-[250px] h-[60vh] opacity-0 max-lg:hidden"></div>
                )}
            </div>
        </div>
    );
};

export default StoryModal;