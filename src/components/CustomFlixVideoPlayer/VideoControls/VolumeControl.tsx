import React from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

interface VolumeControlProps {
    isMuted: boolean;
    volume: number;
    onToggleMute: () => void;
    onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isMobile?: boolean;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
    isMuted,
    volume,
    onToggleMute,
    onVolumeChange,
    isMobile = false
}) => (
    <div className={`${isMobile ? 'md:hidden' : 'max-md:hidden'} flex items-center space-x-2 group relative`}>
        <button onClick={onToggleMute} className="text-white transition-colors">
            {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
        </button>
        <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300">
            <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={isMuted ? 0 : volume}
                onChange={onVolumeChange}
                className="w-16 h-1 bg-secondary-bg-color rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-bg-color"
            />
        </div>
    </div>
);
