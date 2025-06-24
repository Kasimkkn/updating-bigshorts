import { StoryData } from "@/types/storyTypes";
import useUserRedirection from "@/utils/userRedirection";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import Avatar from "../Avatar/Avatar";
import ImageWidget from "../Interactive/ImageWidget";
import LinkWidget from "../Interactive/LinkWidget";
import LocationWidget from "../Interactive/LocationWidget";
import TextWidget from "../Interactive/TextWidget";
import SharePostModal from "../modal/SharePostModal";
import PostInStory from "./PostInStory";
import useLocalStorage from "@/hooks/useLocalStorage";
import SafeImage from "../shared/SafeImage";

interface SharedSsupCardProps {
    story: StoryData;
    onNext: () => void;
    onPrevious: () => void;
    onClose: () => void;
    subStoryIndex: number;
    isTimerPaused: boolean;
    setIsTimerPaused: React.Dispatch<React.SetStateAction<boolean>>;
    duration: number;
    isMuted: boolean;
    onToggleMute: () => void;
}

const SharedSsupCard: React.FC<SharedSsupCardProps> = ({
    story,
    onNext,
    onPrevious,
    onClose,
    subStoryIndex,
    isTimerPaused,
    setIsTimerPaused,
    duration,
    isMuted,
    onToggleMute
}) => {
    // Move currentStory declaration to the top
    const currentStory = story.stories[subStoryIndex];

    const [interactiveData, setInteractiveData] = useState<any>(null);
    const [isShareOpen, setIsShareOpen] = useState<number | null>(null);
    const [videoReady, setVideoReady] = useState(false);
    const [forceReload, setForceReload] = useState(0);
    const videoLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [videoUrl, setVideoUrl] = useState("");
    const [postShare, setPostShare] = useState<any>(null);
    const [id] = useLocalStorage<string>('userId', '');
    const loggedInuserId = id ? parseInt(id) : 0;
    const redirectUser = useUserRedirection();
    const videoRef = useRef<HTMLDivElement | null>(null);

    const userInfo = {
        userId: story.userId,
        userFullName: story.userFullName,
        userProfileImage: story.userProfileImage,
        userName: story.userName,
        userMobileNo: story.userMobileNo,
        userEmail: story.userEmail,
        isVerified: story.isVerified,
        isMuted: story.isMuted
    };

    // Wrap extractVideoUrl with useCallback
    const extractVideoUrl = useCallback(() => {
        if (currentStory?.interactiveVideo) {
            try {
                const interactiveVideoArray = JSON.parse(currentStory.interactiveVideo);
                const rawVideoPath = interactiveVideoArray[0]?.path || "";
                const videoUrl1 = rawVideoPath.replace('https://d1332u4stxguh3.cloudfront.net/', '/video/');

                setVideoUrl(videoUrl1);
                videoLoadingTimeoutRef.current = setTimeout(() => {
                    setForceReload(prev => prev + 1);
                }, 100);
            } catch (error) {
                console.error("Error parsing interactiveVideo JSON:", error);
                setVideoUrl("");
            }
        } else {
            setVideoUrl("");

            if (currentStory?.interactiveVideo) {
                try {
                    const interactiveVideoArray = JSON.parse(currentStory.interactiveVideo);
                    setPostShare(interactiveVideoArray[0]?.functionality_datas?.snip_share ||
                        interactiveVideoArray[0]?.functionality_datas?.ssup_share);
                } catch (error) {
                    console.error("No snipData found:", error);
                }
            }
        }
        return () => {
            if (videoLoadingTimeoutRef.current) {
                clearTimeout(videoLoadingTimeoutRef.current);
            }
        };
    }, [currentStory]);

    // Effect to handle interactive data and video URL
    useEffect(() => {
        // Extract and set interactive data
        if (currentStory?.interactiveVideo) {
            try {
                extractVideoUrl();
                const parsedData = JSON.parse(currentStory.interactiveVideo);
                setInteractiveData(parsedData[0]);
} catch (error) {
                console.error("Error parsing interactiveVideo:", error);
                setInteractiveData(null);
            }
        } else {
            setInteractiveData(null);
        }

        // Handle post share for non-video interactive content
        if (currentStory?.interactiveVideo) {
            try {
                const interactiveVideoArray = JSON.parse(currentStory.interactiveVideo);
                setPostShare(interactiveVideoArray[0]?.functionality_datas?.snip_share ||
                    interactiveVideoArray[0]?.functionality_datas?.ssup_share);
            } catch (error) {
                console.error("No snipData found:", error);
            }
        }
    }, [currentStory, subStoryIndex, extractVideoUrl]);

    // Helper function to check if URL is a video
    const isVideoUrl = (url: string) => {
// Strict check: must end exactly with .mp4
        return url.toLowerCase().trim().endsWith('mp4');
    };

    // Render content based on URL type
    const renderContent = () => {
        // Check for interactive share content first
        if (interactiveData?.functionality_datas?.snip_share || postShare?.ssupItem) {
            return (
                <div className="absolute inset-0 flex items-center justify-center">
                    <PostInStory
                        postShare={interactiveData?.functionality_datas?.snip_share ?
                            interactiveData?.functionality_datas?.ssup_share :
                            postShare}
                        isTimerPaused={isTimerPaused}
                    />
                </div>
            );
        }

        // Check if video URL is valid
        if (isVideoUrl(videoUrl)) {
            return (
                <div
                    ref={videoRef}
                    className="overflow-hidden w-full h-full rounded-lg"
                >
                    <div className="relative w-full h-full">
                        <ReactPlayer
                            key={`${subStoryIndex}-${forceReload}`}
                            url={videoUrl}
                            playing={!isTimerPaused}
                            muted={isMuted}
                            controls={false}
                            loop
                            width="100%"
                            height="100%"
                            playsinline={true}
                            onReady={() => {
setVideoReady(true);
                            }}
                            onError={(e) => {
                                console.error("Video error:", e, "URL:", videoUrl);
                            }}
                            config={{
                                file: {
                                    attributes: {
                                        preload: 'auto'
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            );
        }

        // Fallback to image
        return (
            <SafeImage
                onContextMenu={(e) => e.preventDefault()}
                src={currentStory?.coverFile}
                width={1000}
                height={1000}
                alt="Story content"
                className="w-full h-full object-contain rounded-lg bg-bg-color"
            />
        );
    };

    return (
        <div className="relative w-[350px] h-[95vh] max-md:w-[70%] max-md:h-[75%] z-30 bg-bg-color rounded-lg transition-all mx-2">
            {/* Top gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-40 pointer-events-none"></div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-26 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none"></div>

            {/* <div className="absolute top-2 left-2 right-2 flex space-x-1 z-40">
                {story.stories.map((_, index) => (
                    <div
                        key={`${index}-${subStoryIndex}`}
                        className={`flex-1 h-[2px] rounded-full ${index < subStoryIndex ? "linearBackground" : "bg-secondary-bg-color"}`}
                    >
                        {index === subStoryIndex && (
                            <div
                                className="h-full linearBackground"
                                style={{
                                    animationName: "progressBarAnimation",
                                    animationDuration: `${duration}s`,
                                    animationTimingFunction: "linear",
                                    animationFillMode: "forwards",
                                    animationPlayState: isTimerPaused ? 'paused' : 'running',
                                }}
                            />
                        )}
                    </div>
                ))}
            </div> */}

            {/* User info and buttons */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-start px-2 py-4 z-40">
                <div className="flex items-center space-x-2 w-full">
                    <button
                        onClick={() => {
                            redirectUser(story.userId, `/home/users/${story.userId}`)
                        }}
                        className="flex items-center space-x-2"
                    >
                        <Avatar
                            src={story.userProfileImage}
                            name={story.userEmail}
                            width="w-10"
                            height="h-10"
                            isMoreBorder={false}
                        />
                        <p className="text-primary-text-color text-sm max-md:text-xl">{loggedInuserId === story.userId ? "Your Ssup" : `@${story.userName}`}</p>
                    </button>
                    {/* <p className="text-primary-text-color text-xs opacity-75">
                        {formatTime(story.stories[subStoryIndex]?.scheduleTime || "")}
                    </p> */}
                </div>
            </div>

            {/* <div className="absolute top-4 right-2 z-50">
                <button
                    onClick={onClose}
                    className="text-text-color bg-secondary-bg-color opacity-70 rounded-full h-max w-max p-2"
                >
                    <FaEllipsisVertical />
                </button>
            </div>
            
            <div className="absolute top-14 right-2 z-40">
                <button
                    onClick={onToggleMute}
                    className="text-text-color bg-secondary-bg-color opacity-70 rounded-full h-max w-max p-2"
                >
                    {isMuted ? (
                        <HiMiniSpeakerWave className="text-red-600" />
                    ) : (
                        <HiMiniSpeakerWave />
                    )}
                </button>
            </div> */}

            {/* Navigation buttons */}
            {/* <div className="absolute top-1/2 left-0 right-0 flex justify-between z-40">
                {story.stories.length > 1 && subStoryIndex > 0 && (
                    <button
                        className="relative right-10 text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 p-2"
                        onClick={handlePreviousSubStory}
                    >
                        <FaChevronLeft />
                    </button>
                )}
                {story.stories.length > 1 && subStoryIndex < story.stories.length - 1 && (
                    <button
                        className="relative left-10 text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 p-2"
                        onClick={handleNextSubStory}
                    >
                        <FaChevronRight />
                    </button>
                )}
            </div> */}

            {/* Content rendering */}
            {currentStory.isForInteractiveVideo == 1 && !interactiveData?.functionality_datas?.snip_share ? (
                <div
                    ref={videoRef}
                    className="overflow-hidden w-full h-full rounded-lg"
                >
                    <div className="relative w-full h-full">
                        <ReactPlayer
                            key={`${subStoryIndex}-${forceReload}`}
                            url={videoUrl}
                            playing={!isTimerPaused && videoReady}
                            muted={isMuted}
                            controls={false}
                            loop
                            width="100%"
                            height="100%"
                            playsinline={true}
                            onReady={() => {
setVideoReady(true);
                            }}
                            onStart={() => {
setVideoReady(true);
                            }}
                            onError={(e) => {
                                console.error("Video error:", e);
                                // Try recovery
                                videoLoadingTimeoutRef.current = setTimeout(() => {
                                    setForceReload(prev => prev + 1);
                                }, 500);
                            }}
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
                        {/* Loading overlay */}
                        {!videoReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-bg-color bg-opacity-20">
                                <SafeImage
                                    videoUrl={videoUrl}
                                    src={currentStory?.coverFile}
                                    alt="Loading"
                                    className="w-full h-full object-cover rounded-lg bg-bg-color"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : interactiveData?.functionality_datas?.snip_share || postShare?.ssupItem ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <PostInStory
                        postShare={interactiveData?.functionality_datas?.snip_share ? interactiveData?.functionality_datas?.ssup_share : postShare}
                        isTimerPaused={isTimerPaused}
                    />
                </div>
            ) : (
                <SafeImage
                    onContextMenu={(e) => e.preventDefault()}
                    src={currentStory?.coverFile}
                    width={1000}
                    height={1000}
                    alt="Story content"
                    className="w-full h-full object-contain rounded-lg bg-bg-color"
                />
            )}

            {/* Interactive elements */}
            {interactiveData?.functionality_datas?.list_of_container_text && interactiveData?.functionality_datas?.list_of_container_text.map((text: any, i: number) => {
                return (
                    <TextWidget
                        key={`text-${i}`}
                        index={i}
                        videoDuration={duration}
                        forHomeTrendingList={false}
                        allText={interactiveData?.functionality_datas?.list_of_container_text}
                    />
                );
            })}

            {interactiveData?.functionality_datas?.list_of_images && interactiveData?.functionality_datas?.list_of_images?.map((image: any, i: number) => {
                return (
                    <ImageWidget
                        key={`image-${i}`}
                        goToPosition={() => { }}
                        i={i}
                        playPauseController={() => { }}
                        videoDuration={duration}
                        forHomeTrendingList={false}
                        allImages={interactiveData?.functionality_datas?.list_of_images}
                    />
                );
            })}

            {interactiveData?.functionality_datas?.list_of_links && interactiveData?.functionality_datas?.list_of_links?.map((link: any, i: number) => {
                return (
                    <LinkWidget
                        key={`link-${i}`}
                        i={i}
                        videoDuration={duration}
                        forHomeTrendingList={false}
                        allLinks={interactiveData?.functionality_datas?.list_of_links}
                    />
                );
            })}

            {interactiveData?.list_of_locations && interactiveData?.list_of_locations?.map((location: any, i: number) => (
                <LocationWidget
                    i={i}
                    key={i + 1}
                    playPauseController={() => { }}
                    location={location}
                    parentHeight={750}
                    parentWidth={350}
                />
            ))}

            {/* Bottom buttons and UI */}
            {/* <div className="absolute right-0 bottom-4 w-full flex justify-center items-center gap-4 px-4 py-2 z-40">
                <button
                    className="text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 h-max w-max p-2"
                    onClick={() => { setIsShareOpen(currentStory.postId) }}
                >
                    <CiShare2 />
                </button>
            </div> */}

            {/* Share modal */}
            {isShareOpen && (
                <SharePostModal
                    data={currentStory}
                    userInfo={userInfo}
                    type={5}
                    postId={currentStory.postId}
                    onClose={() => { setIsShareOpen(null) }}
                />
            )}
        </div>
    );
};

export default SharedSsupCard;