import { StoryData } from '@/types/storyTypes';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import { useSwipeable } from 'react-swipeable';
import SharedSsupCard from './StoryCardSsup'; // Use our custom card component

interface SharedSsupViewerProps {
  sharedSsupData: StoryData;
  onClose: () => void;
  scale?: number;
}

const SharedSsupViewer: React.FC<SharedSsupViewerProps> = ({
  sharedSsupData,
  onClose,
  scale = 1
}) => {
  // Transform the single StoryData into an array as expected by the UI
  const storyData = [sharedSsupData];
  
  // All state hooks at the top level
  const [currentUserIndex, setCurrentUserIndex] = useState(0); // Always start with first user
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0); // Always start with first story
  const [isMuted, setIsMuted] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [handleNextCall, setHandleNextCall] = useState(false);
  
  // Initialize with default duration
  const defaultDuration = 15;
  const [duration, setDuration] = useState(defaultDuration);
  const [timer, setTimer] = useState(defaultDuration);
  
  // All refs at the top level
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserIndexRef = useRef(currentUserIndex);
  const currentStoryIndexRef = useRef(currentStoryIndex);
  
  // Safely get current user and story data
  const currentUser = storyData[currentUserIndex] || null;
  const currentStory = currentUser;
  
  // Get audio duration with fallback - defined as a function, not called conditionally
  const getAudioDuration = useCallback(() => {
    try {
      if (currentStory?.stories && currentStory.stories[currentStoryIndex]?.audioDuration) {
        const duration = parseInt(currentStory.stories[currentStoryIndex].audioDuration);
        return isNaN(duration) ? defaultDuration : duration;
      }
      return defaultDuration;
    } catch (error) {
      console.error("Error getting audio duration:", error);
      return defaultDuration;
    }
  }, [currentStory, currentStoryIndex, defaultDuration]);
  
  // Update duration when story changes
  useEffect(() => {
    if (currentStory?.stories && currentStory.stories[currentStoryIndex]) {
      const newDuration = getAudioDuration();
      setDuration(newDuration);
      setTimer(newDuration);
    }
  }, [currentStoryIndex, currentUserIndex, getAudioDuration, currentStory]);
  
  // All handler functions defined before any conditional returns
  const handleAnalyticsStateChange = (isOpen: boolean) => {
    setIsAnalyticsOpen(isOpen);
  };
  
  const handleRemoveStory = (storyId: number, userId: number) => {
};
  
  const handleReadStory = (storyId: number, userId: number) => {
};
  
  const handleReactionUpdate = (storyId: number, reaction: string) => {
};
  
  const handleMuteUpdate = (userId: number, isMuted: number) => {
};
  
  const handleNext = useCallback(() => {
    if (isAnalyticsOpen) return;
    
    if (!currentUser || !currentStory) return;
    
    if (currentStoryIndex < (currentUser.stories?.length || 0) - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      // Close viewer when reaching the end of stories
      // You can add onClose() here if you want to close when reaching the end
    }
  }, [currentStoryIndex, currentUser, currentStory, isAnalyticsOpen]);
  
  const handlePrevious = useCallback(() => {
    if (isAnalyticsOpen) return;
    
    if (!currentUser || !currentStory) return;
    
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Close viewer when trying to go before the first story
      // You can add onClose() here if you want to close when at the beginning
    }
  }, [currentStoryIndex, currentUser, currentStory, isAnalyticsOpen]);
  
  // Prevent setInterval from calling handleNext multiple times
  useEffect(() => {
    if (handleNextCall) {
      handleNext();
    }
  }, [handleNextCall, handleNext]);
  
  // Setup the swipeable handlers - important to define before conditional returns
  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    onSwipedDown: onClose,
    trackMouse: true,
  });
  
  // Timer logic
  useEffect(() => {
    if (!currentUser || !currentStory) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set duration only when index changes
    if (currentUserIndexRef.current !== currentUserIndex || 
        currentStoryIndexRef.current !== currentStoryIndex) {
      const newDuration = getAudioDuration();
      setDuration(newDuration);
      setTimer(newDuration);
    }
    
    // Reset handleNextCall
    setHandleNextCall(false);
    
    // Update refs
    currentUserIndexRef.current = currentUserIndex;
    currentStoryIndexRef.current = currentStoryIndex;
    
    if (!isMuted && !isTimerPaused && !isAnalyticsOpen) {
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
  }, [
    currentStoryIndex, 
    currentUserIndex, 
    isTimerPaused, 
    isMuted, 
    isAnalyticsOpen, 
    duration, 
    currentUser, 
    currentStory,
    getAudioDuration
  ]);
  
  // Validate data structure - AFTER all hooks have been defined
  if (!sharedSsupData || !sharedSsupData.stories || sharedSsupData.stories.length === 0) {
    console.error("Invalid or empty shared SSUP data provided");
    return null;
  }
  
  return (
    <div
      className={`flex items-center justify-center z-40 transform origin-center`}
      style={{
        transform: `scale(${scale})`
      }}
    >
      <SharedSsupCard
        story={currentStory}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onClose={onClose}
        subStoryIndex={currentStoryIndex}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
        duration={duration}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
      />
    </div>
  );
};

export default SharedSsupViewer;