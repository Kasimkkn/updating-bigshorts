import React from 'react';

interface StoryProgressBarProps {
    stories: any[];
    currentIndex: number;
    duration: number;
    isTimerPaused: boolean;
    currentUserIndex?: number;
}

export const StoryProgressBar: React.FC<StoryProgressBarProps> = ({
    stories,
    currentIndex,
    duration,
    isTimerPaused,
    currentUserIndex
}) => {
    return (
        <div className="absolute top-2 left-2 right-2 flex space-x-1 z-40 max-sm:top-3 max-sm:left-3 max-sm:right-3">
            {stories.map((_, index) => (
                <div
                    key={`${index}-${currentIndex}-${currentUserIndex}`}
                    className={`flex-1 h-[2px] max-sm:h-[3px] rounded-full ${index < currentIndex ? "linearBackground" : "bg-secondary-bg-color"
                        }`}
                >
                    {index === currentIndex && (
                        <div
                            className="h-full linearBackground"
                            style={{
                                animationName: "progressBarAnimation",
                                animationDuration: `${duration}s`,
                                animationTimingFunction: "linear",
                                animationFillMode: "forwards",
                                animationPlayState: isTimerPaused ? 'paused' : 'running',
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
