import React, { useRef } from 'react';
import ReactPlayer from 'react-player';
import SafeImage from '../../shared/SafeImage';

interface StoryVideoPlayerProps {
    videoUrl: string;
    isTimerPaused: boolean;
    isMuted: boolean;
    videoReady: boolean;
    onVideoReady: () => void;
    coverFile?: string;
    forceReload: number;
    currentUserIndex: number;
    currentStoryIndex: number;
    onError?: (error: any) => void;
}

export const StoryVideoPlayer: React.FC<StoryVideoPlayerProps> = ({
    videoUrl,
    isTimerPaused,
    isMuted,
    videoReady,
    onVideoReady,
    coverFile,
    forceReload,
    currentUserIndex,
    currentStoryIndex,
    onError
}) => {
    const videoRef = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={videoRef} className="overflow-hidden w-full h-full rounded-lg">
            <div className="relative w-full h-full">
                <ReactPlayer
                    key={`${currentUserIndex}-${currentStoryIndex}-${forceReload}`}
                    url={videoUrl}
                    playing={!isTimerPaused && videoReady}
                    muted={isMuted}
                    controls={false}
                    loop
                    width="100%"
                    height="100%"
                    playsinline={true}
                    onReady={onVideoReady}
                    onStart={onVideoReady}
                    onError={onError}
                    config={{
                        file: {
                            forceHLS: true,
                            attributes: {
                                preload: 'auto'
                            },
                            hlsOptions: {
                                enableWorker: true,
                                startLevel: -1,
                                autoStartLoad: true
                            }
                        }
                    }}
                />
                {!videoReady && coverFile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary-bg-color bg-opacity-20">
                        <SafeImage
                            videoUrl={videoUrl}
                            src={coverFile}
                            alt="Loading"
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

