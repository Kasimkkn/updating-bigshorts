import React, { useEffect, useState } from 'react';
import { IoIosMusicalNotes } from 'react-icons/io';

interface AnimatedTimeAudioNameProps {
    time: string;
    audioName: string;
}

export const AnimatedTimeAudioName: React.FC<AnimatedTimeAudioNameProps> = ({ time, audioName }) => {
    const [showTime, setShowTime] = useState(true);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setShowTime((prev) => !prev);
                setFade(true);
            }, 300);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="inline-flex items-center gap-1 h-5 relative">
            <span
                className={`transition-opacity duration-300 whitespace-nowrap absolute left-0 top-0 w-full flex items-center gap-1 ${showTime && fade ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ height: '100%' }}
            >
                <span className="text-white text-xs max-sm:text-sm opacity-75 whitespace-nowrap">{time}</span>
            </span>
            <span
                className={`transition-opacity duration-300 whitespace-nowrap absolute left-0 top-0 w-full flex items-center gap-1 ${!showTime && fade ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ height: '100%' }}
            >
                <span className="text-white text-xs max-sm:text-sm opacity-75 flex items-center gap-1">
                    <IoIosMusicalNotes className="inline-block align-middle" />
                    {audioName}
                </span>
            </span>
        </span>
    );
};