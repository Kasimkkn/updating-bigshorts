import React from 'react';
import { IoIosEye, IoMdSend } from 'react-icons/io';
import { HiOutlineFaceSmile } from 'react-icons/hi2';
import { CiShare2 } from 'react-icons/ci';

interface StoryBottomActionsProps {
    isOwner: boolean;
    onAnalyticsClick?: () => void;
    onEmojiClick?: () => void;
    onShareClick?: () => void;
    replyValue?: string;
    onReplyChange?: (value: string) => void;
    onSendReply?: () => void;
    currentReaction?: string;
}

export const StoryBottomActions: React.FC<StoryBottomActionsProps> = ({
    isOwner,
    onAnalyticsClick,
    onEmojiClick,
    onShareClick,
    replyValue = '',
    onReplyChange,
    onSendReply,
    currentReaction
}) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 w-full flex justify-between gap-4 sm:gap-6 md:gap-10 px-2 py-3 z-40 max-sm:px-4 max-sm:py-4">
            {isOwner ? (
                <div className="flex w-full justify-center items-center">
                    <button
                        onClick={onAnalyticsClick}
                        className="text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 h-max w-max p-2 max-sm:p-3"
                    >
                        <IoIosEye className="max-sm:text-lg" />
                    </button>
                </div>
            ) : (
                <div className="flex space-x-2 w-full justify-between items-center max-sm:flex-col max-sm:space-x-0 max-sm:space-y-3">
                    <div className="flex w-full items-center space-x-2 max-sm:order-2">
                        <button
                            onClick={onEmojiClick}
                            className="text-white bg-black/50 rounded-lg z-50 h-[32px] w-[32px] p-2 max-sm:h-[40px] max-sm:w-[40px] max-sm:p-2 flex items-center justify-center flex-shrink-0"
                        >
                            {currentReaction ? (
                                <span className="text-sm max-sm:text-base">{currentReaction}</span>
                            ) : (
                                <HiOutlineFaceSmile className="text-sm max-sm:text-base" />
                            )}
                        </button>

                        <div className="w-full relative bg-opacity-100">
                            <input
                                type="text"
                                name="storyReply"
                                placeholder="Write a message..."
                                className="bg-black/50 text-white placeholder-gray-300 rounded-lg border border-white h-8 max-sm:h-10 w-full px-4 max-sm:px-5 pr-12 max-sm:pr-14 text-sm max-sm:text-base focus:bg-black/50 focus:outline-none"
                                value={replyValue}
                                onChange={(e) => onReplyChange?.(e.target.value)}
                            />
                            <button
                                onClick={onSendReply}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white rounded-full h-6 w-6 max-sm:h-7 max-sm:w-7 flex items-center justify-center"
                            >
                                <IoMdSend className="text-sm max-sm:text-base" />
                            </button>
                        </div>

                        <button
                            className="text-white bg-black/50 rounded-lg z-50 h-[32px] w-[32px] max-sm:h-[40px] max-sm:w-[40px] flex items-center justify-center flex-shrink-0"
                            onClick={onShareClick}
                        >
                            <CiShare2 className="text-base max-sm:text-lg" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};