import React from 'react';
import { BiUserPin } from 'react-icons/bi';
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from 'react-icons/hi2';

interface PostActionsProps {
    hasTaggedUsers: boolean;
    onTaggedUsersClick: () => void;
    showInsights: boolean;
    onInsightsClick: () => void;
    showAudioToggle?: boolean;
    isMuted?: boolean;
    onAudioToggle?: () => void;
    className?: string;
}

const PostActions: React.FC<PostActionsProps> = ({
    hasTaggedUsers,
    onTaggedUsersClick,
    showInsights,
    onInsightsClick,
    showAudioToggle,
    isMuted,
    onAudioToggle,
    className = "absolute bottom-5 left-4 right-4 flex justify-between items-center z-20"
}) => {
    return (
        <div className={className}>
            <div className="flex gap-2">
                {hasTaggedUsers && (
                    <div
                        className="flex items-center p-2 bg-bg-color rounded-full text-text-color hover:bg-opacity-80 transition-all cursor-pointer"
                        onClick={onTaggedUsersClick}
                    >
                        <BiUserPin className="h-4 w-4" />
                    </div>
                )}
                {showInsights && (
                    <button
                        onClick={onInsightsClick}
                        className="flex items-center gap-2 p-2 bg-bg-color rounded-full text-text-color hover:bg-opacity-80 transition-all"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M2 20h20" />
                            <path d="M5 4v16" />
                            <path d="M9 4v16" />
                            <path d="M13 4v16" />
                            <path d="M17 4v16" />
                        </svg>
                        <span className="text-sm">Insights</span>
                    </button>
                )}
            </div>
            {showAudioToggle && onAudioToggle && (
                <button
                    className="p-2 bg-bg-color rounded-full text-text-color hover:bg-opacity-80 transition-all"
                    onClick={onAudioToggle}
                >
                    {isMuted ? (
                        <HiOutlineSpeakerXMark className="h-4 w-4" />
                    ) : (
                        <HiOutlineSpeakerWave className="h-4 w-4" />
                    )}
                </button>
            )}
        </div>
    );
};

export default PostActions;
