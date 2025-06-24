import { HighlightData } from '@/models/highlightResponse';
import { getHighlightData } from '@/services/gethighlightstories';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { LiaWindowClose } from "react-icons/lia";
import ReactPlayer from 'react-player';
import Avatar from '../Avatar/Avatar';
import { HighlightCardSkeleton } from '../Skeletons/Skeletons';
import SafeImage from '../shared/SafeImage';

interface HighlightCardProps {
    highlightId: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

const HighlightCard = ({ highlightId, onClose, onNext, onPrev }: HighlightCardProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [highlightData, setHighlightData] = useState<HighlightData>();
    const [storyIndex, setStoryIndex] = useState<number>(0);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [handleNextCall, setHandleNextCall] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);

    const currentStory = highlightData?.stories[storyIndex];
    const [timer, setTimer] = useState(Number(currentStory?.audioDuration) || 15);
    const isVideo = currentStory?.isForInteractiveVideo === 1;

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const storyIndexRef = useRef(storyIndex)
    const videoRef = useRef<HTMLDivElement | null>(null);

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

    const handleNext = () => {
        if (highlightData && storyIndex < highlightData?.stories.length - 1) {
            setStoryIndex((prev) => prev + 1);
        } else {
            setStoryIndex(0);
            onNext();
        }
    }

    const handlePrev = () => {
        if (highlightData && storyIndex > 0) {
            setStoryIndex((prev) => prev - 1);
        } else {
            setStoryIndex(0);
            onPrev();
        }
    }

    useEffect(() => {
        if (handleNextCall) {
            handleNext()
        }
    }, [handleNextCall])

    useEffect(() => {
        if (currentStory) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            //reset timer only when index changes
            if (storyIndexRef.current !== storyIndex) {
                setTimer(Number(currentStory?.audioDuration) || 15);
            }

            // updateRefs
            storyIndexRef.current = storyIndex;

            //reset handleNextCall
            setHandleNextCall(false)

            if (!isTimerPaused) {
                timerRef.current = setInterval(() => {
                    setTimer((prev) => {
                        if (prev === 0) {
                            // direct handleNext call will cause multiple calls to handleNext;
                            setHandleNextCall(true)
                        }
                        return prev - 1;
                    });
                }, 1000);
            }

            setVideoLoading(false); // reset loader when highlight changes

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [storyIndex, isTimerPaused, currentStory]);

    async function fetchHighlightData(id: number) {
        try {
            setLoading(true);
            const response = await getHighlightData({ highlightId: id });
            if (response.isSuccess) {
                const data = Array.isArray(response.data) ? response.data : [];
                setHighlightData(data[0]);
            } else {
}
            setLoading(false);
        } catch (error) {
setLoading(false);
        }
    }

    useEffect(() => {
        fetchHighlightData(highlightId);
    }, [highlightId])

    return (
        <div className="relative w-[350px] h-[80vh] max-md:w-[70%] max-md:h-[75%] bg-bg-color rounded-lg  transition-all mx-2 shadow-md">
            {loading ? (
                <HighlightCardSkeleton />
            ) : currentStory ? (
                <>
                    {/* Progress Bar */}
                    <div className="absolute top-3 left-2 right-2 flex space-x-1">
                        {highlightData.stories.map((_, index) => (
                            <div
                                key={`${index}-${storyIndex}`}
                                className={`flex-1 h-[2px] rounded-full ${index < storyIndex ? "linearBackground" : "bg-secondary-bg-color"
                                    }`}
                            >
                                {index === storyIndex && (
                                    <div
                                        className="h-full linearBackground"
                                        style={{
                                            animationName: "progressBarAnimation",
                                            animationDuration: `${currentStory?.audioDuration || 15}s`,
                                            animationTimingFunction: "linear",
                                            animationFillMode: "forwards",
                                            animationPlayState: isTimerPaused ? 'paused' : 'running',
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* User Info */}
                    <div className="absolute top-1 left-0 right-0 flex items-center justify-start px-2 py-4 z-30">
                        <div className="flex items-center space-x-2 w-full">
                            <button
                                onClick={() => {
                                    //redirectUser(story.userId, `/home/users/${story.userId}`)
                                }}
                                className="text-text-color text-sm max-md:text-xl"
                            >
                                <Avatar
                                    src={highlightData.userProfileImage}
                                    name={highlightData.userName}
                                    width="w-10"
                                    height="h-10" isMoreBorder={false}
                                />
                            </button>
                            <p>@{highlightData.userName}</p>
                        </div>
                    </div>

                    {/* Close button */}
                    <div className="absolute top-6 right-2 z-50">
                        <button
                            onClick={onClose}
                            className="text-text-color bg-secondary-bg-color opacity-70 rounded-full h-max w-max p-1"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>

                    {/* Navigation buttons */}
                    <div className="absolute top-1/2 left-0 right-0 flex justify-between">
                        <button
                            className="relative right-10 text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 p-2"
                            onClick={handlePrev}
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            className="relative left-10 text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 p-2"
                            onClick={handleNext}
                        >
                            <FaChevronRight />
                        </button>
                    </div>

                    {isVideo && videoUrl ? (
                        <div
                            ref={videoRef}
                            className="overflow-hidden w-full h-full rounded-lg relative"
                        >
                            {videoLoading && (
                                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                                    <SafeImage
                                        videoUrl={videoUrl}
                                        src={currentStory.coverFile}
                                        alt="Loading"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <ReactPlayer
                                url={videoUrl}
                                playing={!isTimerPaused}
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
                        <SafeImage 
                        onContextMenu={(e) => e.preventDefault()}
                        src={currentStory.coverFile}
                        alt="Story of non center user"
                        className="w-full h-full object-contain rounded-lg bg-bg-color"
                        />
                    )}
                </>
            ) : (
                <div className='flex items-center justify-center h-full w-full'>
                    <div className="absolute top-4 right-2 z-50">
                        <button
                            onClick={onClose}
                            className="text-text-color bg-secondary-bg-color opacity-70 rounded-full h-max w-max p-2"
                        >
                            <LiaWindowClose size={20} />
                        </button>
                    </div>
                    <p className='text-md text-text-color'>Could not get your Highlight</p>
                </div>
            )
            }
        </div>
    )
}

export default HighlightCard