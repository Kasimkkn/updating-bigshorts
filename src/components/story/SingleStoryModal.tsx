import { StoryData, StoryInsightsData } from '@/types/storyTypes'
import useUserRedirection from '@/utils/userRedirection'
import React, { useEffect, useRef, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import ReactPlayer from 'react-player'
import Avatar from '../Avatar/Avatar'
import CommonModalLayer from '../modal/CommonModalLayer'
import { FaPause, FaPlay } from 'react-icons/fa';
import { MdErrorOutline } from 'react-icons/md';
import useLocalStorage from '@/hooks/useLocalStorage'
import SafeImage from '../shared/SafeImage'

interface SingleStoryModalProps {
    storyData: StoryData[]
    closeModal: () => void,
    isFromMessage: boolean
}
const SingleStoryModal: React.FC<SingleStoryModalProps> = ({ storyData, closeModal, isFromMessage }) => {
    const [currentSubStoryIndex, setCurrentSubStoryIndex] = useState(0);
    const [isMuted, setisMuted] = useState(false);
    const redirectUser = useUserRedirection();
    const [openStoryAnalytics, setOpenStoryAnalytics] = useState(false);
    const [storyInsights, setStoryInsights] = useState<StoryInsightsData>({} as StoryInsightsData);
    const [videoLoading, setVideoLoading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsed, setElapsed] = useState(0); // ms elapsed for current story
    const progressRef = useRef<number>(0);
    const videoRef = useRef<HTMLDivElement | null>(null);
    const currentStory = storyData[0].stories[currentSubStoryIndex];
    const isVideo = currentStory?.isForInteractiveVideo === 1;
    const storyDuration = isVideo ? parseFloat(currentStory?.audioDuration) * 1000 : 5000;

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (!isPaused) {
            const start = Date.now() - elapsed;
            timer = setInterval(() => {
                const newElapsed = Date.now() - start;
                setElapsed(newElapsed);
                if (newElapsed >= storyDuration) {
                    setElapsed(0);
                    if (currentSubStoryIndex < storyData[0].stories.length - 1) {
                        setCurrentSubStoryIndex(currentSubStoryIndex + 1);
                    } else {
                        closeModal();
                    }
                }
            }, 50);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isPaused, currentSubStoryIndex, storyDuration, closeModal, storyData]);

    // Reset elapsed when story changes
    useEffect(() => {
        setElapsed(0);
    }, [currentSubStoryIndex]);

    let videoUrl = "";
    if (isVideo && currentStory.interactiveVideo) {
        try {
            const interactiveVideoArray = JSON.parse(currentStory.interactiveVideo);
            const rawVideoPath = interactiveVideoArray[0]?.path || "";
            videoUrl = rawVideoPath.replace(
                "https://d1332u4stxguh3.cloudfront.net/",
                "/video/"
            );
        } catch (error) {
            console.error("Error parsing interactiveVideo JSON:", error);
        }
    }

    const handlePausePlay = () => {
        setIsPaused((prev) => !prev);
    };
    // Check if story is expired (for message context)
    let isStoryExpired = false;
    if (isFromMessage && currentStory?.storyEndTime) {
        const now = Date.now();
        const endTime = new Date(currentStory.storyEndTime).getTime();
        isStoryExpired = now > endTime;
    }
    return (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto">
            <div className="relative w-full max-w-md mx-auto flex items-center justify-center">
                <div className="relative w-full h-[80vh] max-w-md max-md:w-[95vw] max-md:h-[80vh] bg-bg-color rounded-lg shadow-lg flex flex-col items-center justify-center overflow-hidden min-h-[400px]">
                    {/* Top-right controls: Close and Pause/Play */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-[100]">
                        <button
                            onClick={closeModal}
                            className="cursor-pointer text-text-color bg-secondary-bg-color opacity-70 rounded-full h-max w-max p-2 z-[101]"
                            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                        >
                            <IoMdClose className="text-lg" />
                        </button>
                        {/* Only show play/pause if not expired */}
                        {!(isFromMessage && isStoryExpired) && (
                            <button
                                onClick={handlePausePlay}
                                className="cursor-pointer text-text-color bg-secondary-bg-color opacity-80 rounded-full h-max w-max p-1.5 z-[101]"
                                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                            >
                                {isPaused ? (
                                    <FaPlay className="text-black text-lg" />
                                ) : (
                                    <FaPause className="text-black text-lg" />
                                )}
                            </button>
                        )}
                    </div>
                    {/* If expired, show message */}
                    {isFromMessage && isStoryExpired ? (
                        <div className="flex flex-col items-center justify-center h-full w-full gap-2">
                            <MdErrorOutline className="text-blue-500 text-5xl mb-2" />
                            <span className="text-center text-xl text-text-color font-bold">OOps! Something went wrong...</span>
                            <span className="text-center text-lg text-text-color font-semibold px-6">Ssup may no longer be available</span>
                        </div>
                    ) : (
                        <>
                            {/* Progress Bar */}
                            <div className="absolute top-2 left-2 right-2 flex space-x-1 z-20">
                                {storyData[0].stories.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`flex-1 h-[2px] rounded-full bg-primary-bg-color ${index < currentSubStoryIndex ? "bg-primary-bg-color" : ""}`}
                                    >
                                        {index === currentSubStoryIndex && (
                                            <div
                                                className="h-full linearBackground"
                                                style={{ width: `${Math.min(100, (elapsed / storyDuration) * 100)}%`, transition: isPaused ? 'none' : 'width 50ms linear' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* User Info */}
                            <div className="absolute top-0 left-0 right-0 flex items-center justify-start px-2 py-4 z-20">
                                <div className="flex items-center space-x-2 w-full">
                                    <Avatar
                                        src={storyData[0].userProfileImage}
                                        name={storyData[0].userName}
                                        width="w-10"
                                        height="h-10" isMoreBorder={false} />
                                    <button
                                        onClick={() => {
                                            redirectUser(storyData[0].userId, `/home/users/${storyData[0].userId}`)
                                        }}
                                        className="text-text-color text-sm max-md:text-xl"
                                    >
                                        @{storyData[0].userName}
                                    </button>
                                </div>
                            </div>
                            {/* Media Section */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                {isVideo && videoUrl ? (
                                    <div ref={videoRef} className="overflow-hidden w-full h-full rounded-lg bg-bg-color relative flex items-center justify-center">
                                        {videoLoading && (
                                            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                                                <SafeImage
                                                    videoUrl={videoUrl}
                                                    src={currentStory?.coverFile}
                                                    alt="Loading"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <ReactPlayer
                                            url={videoUrl}
                                            playing={!isPaused}
                                            muted={isMuted}
                                            controls={false}
                                            loop
                                            width="100%"
                                            height="100%"
                                            config={{ file: { forceHLS: true } }}
                                            onReady={() => setVideoLoading(false)}
                                            onBuffer={() => setVideoLoading(true)}
                                            onBufferEnd={() => setVideoLoading(false)}
                                            onStart={() => setVideoLoading(false)}
                                            onPlay={() => setVideoLoading(false)}
                                            onPause={() => setVideoLoading(false)}
                                            onError={() => setVideoLoading(false)}
                                            onClickPreview={() => setVideoLoading(true)}
                                            onLoad={() => setVideoLoading(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <SafeImage
                                            onContextMenu={(e) => e.preventDefault()}
                                            src={currentStory?.coverFile}
                                            width={500}
                                            height={500}
                                            alt="Single Story "
                                            className="w-full h-full object-contain rounded-lg bg-bg-color"
                                        />
                                    </div>
                                )}
                            </div>

                        </>
                    )}
                    {/* ...existing code for style jsx... */}
                    <style jsx>{`
                        .linearBackground {
                            background: linear-gradient(
                                to right,
                                #4f46e5,
                                #8b5cf6,
                                #ec4899
                            );
                        }
                    `}</style>
                    {/* Bottom Controls */}
                </div>
            </div>
        </div>
    );
}

export default SingleStoryModal