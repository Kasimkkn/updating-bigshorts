import React from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { HiMiniSpeakerWave } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';

interface StoryControlsProps {
    onOptionsClick: () => void;
    onPlayPause: () => void;
    onToggleMute?: () => void;
    onClose?: () => void;
    isTimerPaused: boolean;
    isMuted?: boolean;
    showMuteButton?: boolean;
    showCloseButton?: boolean;
    isMobile?: boolean;
}

export const StoryControls: React.FC<StoryControlsProps> = ({
    onOptionsClick,
    onPlayPause,
    onToggleMute,
    onClose,
    isTimerPaused,
    isMuted,
    showMuteButton = false,
    showCloseButton = false,
    isMobile = false
}) => {
    return (
        <>
            {/* Close button for mobile */}
            {showCloseButton && isMobile && (
                <div className="absolute top-4 right-2 z-50 max-sm:top-8 md:hidden">
                    <button
                        onClick={onClose}
                        className="text-white bg-black/50 rounded-lg h-10 w-10 flex items-center justify-center"
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>
            )}

            {/* Options button */}
            <div className={`absolute top-4 right-2 z-50 ${showCloseButton && isMobile ? 'max-sm:top-20' : ''}`}>
                <button
                    onClick={onOptionsClick}
                    className="text-white bg-black/50 rounded-lg h-[32px] w-[32px] max-sm:h-[40px] max-sm:w-[40px] flex items-center justify-center"
                >
                    <FaEllipsisVertical className="text-base sm:text-lg" />
                </button>
            </div>

            {/* Play/Pause button */}
            <div className={`absolute top-14 right-2 z-40 ${showCloseButton && isMobile ? 'max-sm:top-[7.8rem]' : ''}`}>
                <button
                    onClick={onPlayPause}
                    className="text-white bg-black/50 rounded-lg h-[32px] w-[32px] max-sm:h-[40px] max-sm:w-[40px] flex items-center justify-center"
                >
                    {isTimerPaused ? (
                        <FaPlay className="text-white" />
                    ) : (
                        <FaPause className="text-white" />
                    )}
                </button>
            </div>

            {/* Mute/Unmute button */}
            {showMuteButton && onToggleMute && (
                <div className={`absolute top-24 right-2 z-40 ${showCloseButton && isMobile ? 'max-sm:top-[10.6rem]' : ''}`}>
                    <button
                        onClick={onToggleMute}
                        className="text-white bg-black/50 rounded-lg h-[32px] w-[32px] max-sm:h-[40px] max-sm:w-[40px] flex items-center justify-center"
                    >
                        {isMuted ? (
                            <HiMiniSpeakerWave className="text-red-400" />
                        ) : (
                            <HiMiniSpeakerWave className="text-white" />
                        )}
                    </button>
                </div>
            )}
        </>
    );
};
