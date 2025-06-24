import React from 'react'
import { emojiList } from '@/types/storyTypes'
import { FaPlus } from 'react-icons/fa';

interface EmojiUiProps {
    onClose: () => void;
    onOpenFullEmojiUi: () => void;
    handletStoryReaction: (emoji: string) => void;
    currentReaction?: string;  // Add this prop
}

export const HalfEmojiUi = ({
    onClose,
    onOpenFullEmojiUi,
    handletStoryReaction,
    currentReaction
}: EmojiUiProps) => {

    const selectedTheEmoji = (emoji: string) => {
        handletStoryReaction(emoji);
        onClose();
    };

    const toggleOpenFullEmoji = () => {
        onOpenFullEmojiUi();
        onClose();
    }
    return (
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-bg-color bg-opacity-50">
            {emojiList.slice(0, 5).map((emoji, index) => (
                <span
                    onClick={() => selectedTheEmoji(emoji)}
                    key={index}
                    className={`text-2xl cursor-pointer hover:scale-125 transition-transform ${emoji === currentReaction ? 'scale-125' : ''
                        }`}
                >
                    {emoji}
                </span>
            ))}
            <button
                onClick={toggleOpenFullEmoji}
                className="text-2xl text-primary-text-color hover:scale-125 transition-transform"
            >
                <FaPlus />
            </button>
        </div>
    );
};

interface FullEmojiUiProps {
    onClose: () => void;
    handletStoryReaction: (emoji: string) => void;
    currentReaction?: string;  // Add this prop
}

export const FullEmojiUi = ({ onClose, handletStoryReaction, currentReaction }: FullEmojiUiProps) => {
    const selectedTheEmoji = (emoji: string) => {
        handletStoryReaction(emoji);
        onClose();
    };

    return (
        <div className="bg-bg-color bg-opacity-50 backdrop-blur-sm rounded-lg w-80 max-h-72 shadow-lg relative">
            <button
                className="absolute rotate-45 -top-2 -right-2 text-xl text-primary-text-color z-10 hover:scale-125 transition-transform bg-bg-color bg-opacity-50 rounded-full p-2"
                onClick={onClose}
            >
                <FaPlus />
            </button>
            <div className="grid grid-cols-6 gap-2 p-4 overflow-y-auto max-h-[280px] scrollbar-hide">
                {emojiList.map((emoji, index) => (
                    <span
                        onClick={() => selectedTheEmoji(emoji)}
                        key={index}
                        className={`text-2xl cursor-pointer hover:scale-125 transition-transform ${emoji === currentReaction ? 'scale-125' : ''
                            }`}
                    >
                        {emoji}
                    </span>
                ))}
            </div>
        </div>
    );
};
