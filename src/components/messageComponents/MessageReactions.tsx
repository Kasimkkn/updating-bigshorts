import { emojiList } from '@/types/storyTypes';
import React, { useState } from 'react'
import { FaPlus } from "react-icons/fa6";


interface MessageReactionsProps {
  setReaction: (reaction: { messageId: number; reaction: string; } | null) => void;
  onClose: (value: number | null) => void;
  messageId: number;
  isUsersMessage: boolean;
  isExpandedDefault?: boolean
}

const MessageReactions = ({ onClose, setReaction, messageId, isUsersMessage, isExpandedDefault = false }: MessageReactionsProps) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

  return (
    <div className={`absolute w-64 max-h-64 grid grid-cols-6 gap-2 p-2 bg-bg-color border border-border-color shadow-md rounded-md overflow-y-auto z-50 ${isUsersMessage ? 'right-0 -top-full' : 'left-10 -top-full'}`}>
      {isExpanded ? (
        <>
          {emojiList.map((emoji, index) => (
            <span
              key={index}
              className="text-lg cursor-pointer rounded-md p-1"
              onClick={() => {
                setReaction({ messageId, reaction: emoji });
                onClose(null);
              }}
            >
              {emoji}
            </span>
          ))}
        </>
      ) : (
        <>
          {emojiList.slice(0, 5).map((emoji, index) => (
            <span
              key={index}
              className="text-lg text-center cursor-pointer rounded-md p-1"
              onClick={() => {
                setReaction({ messageId, reaction: emoji });
                onClose(null);
              }}
            >
              {emoji}
            </span>
          ))}
          <span
            key={6}
            className="cursor-pointer flex items-center justify-center text-text-color rounded-md p-1"
            onClick={() => setIsExpanded(true)}
          >
            <FaPlus />
          </span>
        </>
      )}
    </div>
  )
}

export default MessageReactions