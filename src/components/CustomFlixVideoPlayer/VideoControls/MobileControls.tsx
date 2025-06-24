import React from 'react';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { MdPictureInPictureAlt } from 'react-icons/md';
import { VolumeControl } from './VolumeControl';
import { SettingsMenu } from './SettingsMenu';

interface MobileControlsProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onTogglePiP: () => void;
    volumeProps: any;
    settingsProps: any;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
    isFullscreen,
    onToggleFullscreen,
    onTogglePiP,
    volumeProps,
    settingsProps
}) => (
    <div className='md:hidden absolute top-0 left-0 w-full h-max flex justify-between p-2'>
        <div className='flex items-center gap-2'>
            <button onClick={onToggleFullscreen} className="text-white transition-colors">
                {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
            </button>
            <button onClick={onTogglePiP} className="text-white transition-colors" title="Picture-in-Picture">
                <MdPictureInPictureAlt size={18} />
            </button>
        </div>
        <div className='flex items-center gap-2'>
            <VolumeControl {...volumeProps} isMobile={true} />
            <SettingsMenu {...settingsProps} isMobile={true} />
        </div>
    </div>
);
