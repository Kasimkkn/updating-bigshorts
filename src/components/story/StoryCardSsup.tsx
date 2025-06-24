import useLocalStorage from "@/hooks/useLocalStorage";
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
import SafeImage from "../shared/SafeImage";
import PostInStory from "./PostInStory";

interface SharedSsupCardProps {
    story: StoryData;
    onNext?: () => void;
    onPrevious?: () => void;
    onClose?: () => void;
    subStoryIndex: number;
    isTimerPaused: boolean;
    setIsTimerPaused?: React.Dispatch<React.SetStateAction<boolean>>;
    duration: number;
    isMuted: boolean;
    onToggleMute?: () => void;
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

    const extractVideoUrl = useCallback(() => {
        if (currentStory?.interactiveVideo) {
            try {
                const interactiveVideoArray = JSON.parse(currentStory.interactiveVideo);
                const rawVideoPath = interactiveVideoArray[0]?.path ?? "";
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
                    setPostShare(interactiveVideoArray[0]?.functionality_datas?.snip_share ??
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

    useEffect(() => {
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

        if (currentStory?.interactiveVideo) {
            try {
                const interactiveVideoArray = JSON.parse(currentStory.interactiveVideo);
                setPostShare(interactiveVideoArray[0]?.functionality_datas?.snip_share ??
                    interactiveVideoArray[0]?.functionality_datas?.ssup_share);
            } catch (error) {
                console.error("No snipData found:", error);
            }
        }
    }, [currentStory, subStoryIndex, extractVideoUrl]);

    const isVideoUrl = (url: string) => {
        return url.toLowerCase().trim().endsWith('mp4');
    };

    return (
        <div className="relative w-[350px] h-[95vh] max-md:w-[70%] max-md:h-[75%] z-30 bg-bg-color rounded-lg transition-all mx-2">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-40 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-26 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none"></div>
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
                </div>
            </div>
            {currentStory.isForInteractiveVideo === 1 && !interactiveData?.functionality_datas?.snip_share ? (
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

            {interactiveData?.functionality_datas?.list_of_container_text?.map((text: any, i: number) => (
                <TextWidget
                    key={`text-${i}`}
                    index={i}
                    videoDuration={duration}
                    forHomeTrendingList={false}
                    allText={interactiveData?.functionality_datas?.list_of_container_text}
                />
            ))}

            {interactiveData?.functionality_datas?.list_of_images?.map((image: any, i: number) => (
                <ImageWidget
                    key={`image-${i}`}
                    goToPosition={() => { }}
                    i={i}
                    playPauseController={() => { }}
                    videoDuration={duration}
                    forHomeTrendingList={false}
                    allImages={interactiveData?.functionality_datas?.list_of_images}
                />
            ))}

            {interactiveData?.functionality_datas?.list_of_links?.map((link: any, i: number) => (
                <LinkWidget
                    key={`link-${i}`}
                    i={i}
                    videoDuration={duration}
                    forHomeTrendingList={false}
                    allLinks={interactiveData?.functionality_datas?.list_of_links}
                />
            ))}

            {interactiveData?.list_of_locations?.map((location: any, i: number) => (
                <LocationWidget
                    i={i}
                    key={i + 1}
                    playPauseController={() => { }}
                    location={location}
                    parentHeight={750}
                    parentWidth={350}
                />
            ))}

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