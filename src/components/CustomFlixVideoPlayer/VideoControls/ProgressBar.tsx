import React from 'react';

interface ProgressBarProps {
    played: number;
    onSeekMouseDown: () => void;
    onSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSeekMouseUp: (e: React.MouseEvent<HTMLInputElement>) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    played,
    onSeekMouseDown,
    onSeekChange,
    onSeekMouseUp
}) => (
    <div className="mb-1">
        <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            onMouseDown={onSeekMouseDown}
            onChange={onSeekChange}
            onMouseUp={onSeekMouseUp}
            className="w-full h-1 bg-secondary-bg-color rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-bg-color"
        />
    </div>
);
