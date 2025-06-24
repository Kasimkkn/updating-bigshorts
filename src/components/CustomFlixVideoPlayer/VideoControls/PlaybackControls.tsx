import React from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';
import { TbRewindBackward10, TbRewindForward10 } from 'react-icons/tb';

interface PlaybackControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onSkip: (seconds: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    isPlaying,
    onPlayPause,
    onSkip
}) => (
    <>
        <button onClick={() => onSkip(-10)} className="text-white transition-colors flex items-center">
            <TbRewindBackward10 size={20} />
        </button>
        <button onClick={onPlayPause} className="text-white transition-colors">
            {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
        </button>
        <button onClick={() => onSkip(10)} className="text-white transition-colors flex items-center">
            <TbRewindForward10 size={20} />
        </button>
    </>
);