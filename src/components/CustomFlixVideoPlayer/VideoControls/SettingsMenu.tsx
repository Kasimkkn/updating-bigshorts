import React from 'react';
import { FiChevronLeft, FiMoreVertical } from 'react-icons/fi';

interface SettingsMenuProps {
    showSettings: boolean;
    showQualitySettings: boolean;
    showPlaybackSettings: boolean;
    quality: string;
    playbackRate: number;
    qualities: string[];
    playbackRates: number[];
    onToggleSettings: () => void;
    onShowQualitySettings: () => void;
    onShowPlaybackSettings: () => void;
    onQualityChange: (quality: string) => void;
    onPlaybackRateChange: (rate: number) => void;
    onBack: () => void;
    isMobile?: boolean;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
    showSettings,
    showQualitySettings,
    showPlaybackSettings,
    quality,
    playbackRate,
    qualities,
    playbackRates,
    onToggleSettings,
    onShowQualitySettings,
    onShowPlaybackSettings,
    onQualityChange,
    onPlaybackRateChange,
    onBack,
    isMobile = false
}) => (
    <div className="relative flex">
        <button
            onClick={onToggleSettings}
            className={`text-white transition-colors ${showSettings ? 'text-purple-400' : ''}`}
        >
            <FiMoreVertical size={18} />
        </button>

        {showSettings && (
            <div className={`absolute ${isMobile ? 'top-4 right-4' : 'bottom-full right-0 mb-2'} w-${isMobile ? '48' : '44'} bg-bg-color bg-opacity-90 rounded-md shadow-lg p-2 text-sm`}>
                {!showQualitySettings && !showPlaybackSettings && (
                    <div className="space-y-1">
                        <button
                            onClick={onShowPlaybackSettings}
                            className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded"
                        >
                            <span>Playback Speed</span>
                            <span>{playbackRate}x</span>
                        </button>
                        <button
                            onClick={onShowQualitySettings}
                            className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded"
                        >
                            <span>Quality</span>
                            <span>{quality}</span>
                        </button>
                    </div>
                )}

                {showQualitySettings && (
                    <div className="space-y-1">
                        <div className="flex items-center px-2 py-1">
                            <button onClick={onBack} className="mr-2 text-white">
                                <FiChevronLeft size={16} />
                            </button>
                            <span>Quality</span>
                        </div>
                        <div className="px-1">
                            {qualities.map(q => (
                                <button
                                    key={q}
                                    onClick={() => onQualityChange(q)}
                                    className={`flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded ${quality === q ? 'bg-secondary-bg-color' : ''}`}
                                >
                                    <span>{q}</span>
                                    {quality === q && (
                                        <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {showPlaybackSettings && (
                    <div className="space-y-1">
                        <div className="flex items-center px-2 py-1">
                            <button onClick={onBack} className="mr-2 text-white">
                                <FiChevronLeft size={16} />
                            </button>
                            <span>Playback Speed</span>
                        </div>
                        <div className="px-1">
                            {playbackRates.map(rate => (
                                <button
                                    key={rate}
                                    onClick={() => onPlaybackRateChange(rate)}
                                    className={`flex items-center justify-between w-full px-3 py-1.5 hover:bg-secondary-bg-color rounded ${playbackRate === rate ? 'bg-secondary-bg-color' : ''}`}
                                >
                                    <span>{rate}x</span>
                                    {playbackRate === rate && (
                                        <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
);
