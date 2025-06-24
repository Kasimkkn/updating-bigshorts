import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import Button from '../shared/Button';
import Input from '../shared/Input';
import VideoSettings from '../createSnip/VideoSettings';

interface TrimmerModalProps {
    modalTitle: string;
    videoSrc: string;
    closeModal: () => void;
    saveModal: (data: { start: number, end: number }) => void;
    handleNext?: () => void;
    maxDuration?: number;
    playerRef?: React.RefObject<HTMLVideoElement>;
    setStartTime: (time: number) => void;
    setEndTime: (time: number) => void;
    setVideoDuration: (time: number) => void;
    videoIndex?: number;
    setVideoKey?: React.Dispatch<React.SetStateAction<number>>
}

const TrimmerModal: React.FC<TrimmerModalProps> = ({ modalTitle, videoSrc, closeModal, saveModal, handleNext, maxDuration, playerRef, setEndTime, setStartTime, setVideoDuration, videoIndex, setVideoKey }) => {

    return (
        <div className="fixed inset-0 z-50 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative bg-bg-color text-text-color p-4 rounded-lg w-3/4 max-w-4xl h-[90vh]">
                <div className="flex justify-between items-center mb-5">
                    <h1 className="text-xl font-bold">{modalTitle}</h1>
                    <button onClick={closeModal} className="text-text-color hover:text-text-color text-xl">
                        &#x2715;
                    </button>
                </div>
                <div className='flex gap-3 w-full p-2'>
                    <div className="w-1/2 h-[70vh] bg-primary-bg-color">
                        <video
                            ref={playerRef}
                            src={videoSrc}
                            muted
                            className="h-[550px]"
                            autoPlay
                            loop
                        />
                    </div>
                    <VideoSettings
                        handleNext={closeModal}
                        maxDuration={maxDuration!}
                        playerRef={playerRef!}
                        setEndTime={setEndTime}
                        setStartTime={setStartTime}
                        setVideoDuration={setVideoDuration}
                        videoIndex={videoIndex!}
                        key={'videoSettings'}
                        setVideoKey={setVideoKey}
                        minDuration={0}
                        setTimeLine={saveModal}
                    />
                </div>
            </div>
        </div>
    );
};

export default TrimmerModal;
