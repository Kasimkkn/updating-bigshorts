import { FinalJsonContext } from '@/context/useInteractiveVideo';
import { trimVideo, TrimVideoResult } from '@/utils/trimVideo';
import React, { useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdPause, IoMdPlay, IoMdSkipBackward, IoMdSkipForward } from 'react-icons/io';
import { ModerSpinner } from '../LoadingSpinner';
import Button from '../shared/Button';

interface VideoSettingsProps {
    setStartTime: (time: number) => void;
    setEndTime: (time: number) => void;
    setVideoDuration: (time: number) => void;
    maxDuration: number;
    playerRef: React.RefObject<HTMLVideoElement>;
    videoIndex: number
    setVideoKey?: React.Dispatch<React.SetStateAction<number>>
    handleNext: () => void
    setTimeLine?: (data: {
        start: number;
        end: number;
    }) => void
    minDuration?: number
}

const VideoSettings: React.FC<VideoSettingsProps> = ({
    playerRef,
    maxDuration,
    setStartTime,
    setEndTime,
    setVideoDuration,
    videoIndex,
    setVideoKey,
    handleNext,
    setTimeLine,
    minDuration = 3 // 3 when actually trimming the video, 0 for elements timeline
}) => {
    const context = useContext(FinalJsonContext);

    if (!context) {
        throw new Error('AddInteractiveElements must be used within a FinalJsonProvider');
    }

    const { setVideoList, videoList } = context;
    const [start, setStart] = useState<number>(0);
    const [end, setEnd] = useState<number>(0);
    const [isTrimming, setIsTrimming] = useState<boolean>(false)
    const [isDraggingStart, setIsDraggingStart] = useState<boolean>(false);
    const [isDraggingEnd, setIsDraggingEnd] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const sliderRef = useRef<HTMLDivElement>(null);

    const formatTime = (time: number) => time.toFixed(2);

    useEffect(() => {
        setEnd(maxDuration);
    }, [maxDuration]);

    useEffect(() => {
        const updateTime = () => {
            if (playerRef.current) {
                setCurrentTime(playerRef.current.currentTime);
            }
        };

        const interval = setInterval(updateTime, 100);
        return () => clearInterval(interval);
    }, [playerRef]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingStart && !isDraggingEnd) return;
            if (!sliderRef.current) return;

            const rect = sliderRef.current.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            const newTime = Math.max(0, Math.min(maxDuration, position * maxDuration));

            if (isDraggingStart) {
                if (newTime < end && end - newTime >= minDuration) {
                    setStart(newTime);
                    setStartTime(newTime);
                    setVideoDuration(end - newTime);
                    // Move playhead to start position
                    if (playerRef.current) {
                        playerRef.current.currentTime = newTime;
                    }
                }
            } else if (isDraggingEnd) {
                if (newTime > start && newTime - start >= minDuration) {
                    setEnd(newTime);
                    setEndTime(newTime);
                    setVideoDuration(newTime - start);
                }
            }
        };

        const handleMouseUp = () => {
            setIsDraggingStart(false);
            setIsDraggingEnd(false);
        };

        if (isDraggingStart || isDraggingEnd) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingStart, isDraggingEnd, start, end, maxDuration, setStartTime, setEndTime, setVideoDuration, playerRef]);

    const seekToPosition = (position: number) => {
        if (playerRef.current) {
            playerRef.current.currentTime = position;
        }
    };

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = parseFloat(e.target.value);
        if (newStart < end) {
            setStart(newStart);
            setStartTime(newStart);
            setVideoDuration(Math.abs(end - newStart));
            if (playerRef.current) {
                playerRef.current.currentTime = newStart;
            }
        }
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEnd = parseFloat(e.target.value);
        if (newEnd > start) {
            setEnd(newEnd);
            setEndTime(newEnd);
            setVideoDuration(Math.abs(newEnd - start));
        }
    };

    const handleSkip = () => {
        setStart(0);
        setStartTime(0);
        setEndTime(0);
        handleNext();
        setVideoKey && setVideoKey(prevKey => prevKey + 1); //reload sets endTime to videoDuration in addInteravtiveElements
    }

    const handleTrimVideo = async () => {

        //setting timeline for elements
        if (setTimeLine) {
            setTimeLine({
                start: start,
                end: end
            })
            return;
        }

        // trimming video
        // Get the file from your state
        const videoFileSrc = videoList[videoIndex].path;
        const videoFile = await fetch(videoFileSrc).then(res => res.blob());

        // Show loading state
        setIsTrimming(true);

        try {
            const result: TrimVideoResult = await trimVideo(videoFile, start, end);

            if (result.success && result.url && result.blob) {
                // Update your state with the trimmed video URL
                const updatedVideoList = [...videoList];
                updatedVideoList[videoIndex] = {
                    ...updatedVideoList[videoIndex],
                    path: result.url,
                };

                setVideoList(updatedVideoList);
                setVideoKey && setVideoKey(prevKey => prevKey + 1);
                setStart(0);
                setStartTime(0);
                setEndTime(0);
                handleNext();

                // Update the player to show the trimmed video
                if (playerRef.current) {
                    playerRef.current.src = result.url;
                    playerRef.current.currentTime = 0;
                    playerRef.current.play().catch(e => console.error("Could not autoplay:", e));
                }

                // Success message - use a toast notification if available
toast.success('Video trimmed successfully!');
            } else {
                // Handle error
                toast.error(`Failed to trim video: ${result.error}`);
            }
        } catch (error) {
            console.error('Error in trim process:', error);
            toast.error('An error occurred while trimming the video');
        } finally {
            setIsTrimming(false);
        }
    };

    return (
        <div className="relative w-full md:h-full flex flex-col gap-2 md:m-4">

            <h2 className='text-center md:my-10'>Select video duration</h2>

            <div className="text-center text-sm mb-2">
                Current Position: <span className="font-medium">{formatTime(currentTime)}s</span>
            </div>

            <div className="md:my-6 px-4 relative">
                {/* Slider track */}
                <div
                    ref={sliderRef}
                    className="h-2 bg-bg-color/50 rounded-full w-full relative"
                >
                    {/* Selected range */}
                    <div
                        className="absolute h-full linearBackground rounded-full"
                        style={{
                            left: `${(start / maxDuration) * 100}%`,
                            width: `${((end - start) / maxDuration) * 100}%`
                        }}
                    ></div>

                    {/* Start handle */}
                    <div
                        className="absolute w-5 h-5 linearBackground rounded-full -ml-2 top-1/2 transform -translate-y-1/2 cursor-ew-resize flex items-center justify-center"
                        style={{ left: `${(start / maxDuration) * 100 - 3}%` }}
                        onMouseDown={() => setIsDraggingStart(true)}
                    >
                        <div className="w-3 h-3 bg-primary-bg-color rounded-full"></div>
                    </div>

                    {/* End handle */}
                    <div
                        className="absolute w-5 h-5 linearBackground rounded-full -ml-2 top-1/2 transform -translate-y-1/2 cursor-ew-resize flex items-center justify-center"
                        style={{ left: `${(end / maxDuration) * 100 + 2}%` }}
                        onMouseDown={() => setIsDraggingEnd(true)}
                    >
                        <div className="w-3 h-3 bg-primary-bg-color rounded-full"></div>
                    </div>

                    {/* Current position indicator */}
                    <div
                        className="absolute w-0.5 h-6 bg-blue-500 -ml-[1px] -top-2"
                        style={{ left: `${(currentTime / maxDuration) * 100}%` }}
                    ></div>
                </div>

                {/* Time markers */}
                <div className="flex justify-between mt-4 text-xs text-text-color">
                    <span>{formatTime(start)}s</span>
                    <span>{formatTime(end)}s</span>
                </div>
            </div>

            <div className="relative flex justify-center gap-4 mt-2 mb-4">
                <button
                    onClick={() => seekToPosition(Math.max(currentTime - 5, start))}
                    className="p-2 bg-bg-color hover:bg-primary-bg-color text-text-color rounded-full"
                    title="Skip 5 seconds"
                >
                    <IoMdSkipBackward />
                </button>

                <button
                    onClick={() => {
                        if (playerRef.current) {
                            if (playerRef.current.paused) {
                                playerRef.current.play();
                            } else {
                                playerRef.current.pause();
                            }
                        }
                    }}
                    className="p-2 bg-bg-color hover:bg-bg-color-70 text-text-color rounded-full"
                    title="Play/Pause"
                >
                    {playerRef.current?.paused ? (
                        <IoMdPlay />
                    ) : (
                        <IoMdPause />
                    )}
                </button>

                <button
                    onClick={() => seekToPosition(Math.min(currentTime + 5, end))}
                    className="p-2 bg-bg-color hover:bg-primary-bg-color text-text-color rounded-full"
                    title="Go back 5 seconds"
                >
                    <IoMdSkipForward />
                </button>
            </div>
            <div className='flex justify-between'>
                <Button
                    onClick={handleTrimVideo}
                    disabled={isTrimming || start >= end}
                    isLinearBtn={true}>
                    {isTrimming ? <ModerSpinner /> : "Apply"}
                </Button>
                <Button
                    onClick={handleSkip}
                    disabled={isTrimming || start >= end}
                    isLinearBorder={true}>
                    Skip
                </Button>
                {isTrimming && (
                    <p className="mt-2 text-sm text-text-color">Editing your video...</p>
                )}
            </div>
        </div>
    );
};

export default VideoSettings;
