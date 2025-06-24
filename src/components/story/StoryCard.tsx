import { addStoryViewCounts } from "@/services/addstoryviewcounts";
import { deletePost } from "@/services/deletepost";
import { StoryViewer, getStoryViewerList } from "@/services/getstoryviewer";
import { muteStory } from "@/services/mutestory";
import { storyReaction } from "@/services/storyreaction";
import { storyReply } from "@/services/storyreply";
import { unMuteStory } from "@/services/unmutestory";
import { StoryData } from "@/types/storyTypes";
import useUserRedirection from "@/utils/userRedirection";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { CiShare2 } from "react-icons/ci";
import { FaChevronLeft, FaChevronRight, FaPause, FaPlay } from "react-icons/fa";
import { FaEllipsisVertical } from "react-icons/fa6";
import { HiArrowLeft, HiMiniSpeakerWave, HiOutlineFaceSmile } from "react-icons/hi2";
import { IoIosEye, IoIosMusicalNote, IoIosMusicalNotes, IoIosSend, IoMdClose, IoMdSend } from "react-icons/io";
import ReactPlayer from "react-player";
import Avatar from "../Avatar/Avatar";
import FollowButton from "../FollowButton/FollowButton";
import ImageWidget from "../Interactive/ImageWidget";
import LinkWidget from "../Interactive/LinkWidget";
import LocationWidget from "../Interactive/LocationWidget";
import TextWidget from "../Interactive/TextWidget";
import ReportModal from "../modal/ReportModal";
import SharePostModal from "../modal/SharePostModal";
import EmojiAnimation from "./EmojiAnimation";
import { FullEmojiUi, HalfEmojiUi } from "./EmojiUi";
import PostInStory from "./PostInStory";
import StoryAnalytics from "./StoryAnalytics";
import toast from 'react-hot-toast';
import useLocalStorage from "@/hooks/useLocalStorage";
import Button from "../shared/Button";
import AudioPost from "../posts/AudioPost";
import { IoClose } from "react-icons/io5";
import SafeImage from "../shared/SafeImage";

interface StoryCardProps {
    story: StoryData;
    isCenter: boolean;
    onNext: () => void;
    onPrevious: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
    setIsTimerPaused: React.Dispatch<React.SetStateAction<boolean>>,
    onAnalyticsStateChange?: (isOpen: boolean) => void;
    removeStory: (storyId: number, userId: number) => void;
    readStory: (storyId: number, userId: number) => void;
    subStoryIndex: number;
    isTimerPaused: boolean;
    duration: number; //set duration of progress animation
    currentUserIndex: number; // to reset progress animation on UserIndex change
    onMute: (userId: number, isMuted: number) => void;  // Add this new prop
    onReactionUpdate?: (storyId: number, reaction: string) => void;
    onMuteUpdate: (userId: number, isMuted: number) => void;
    onCloseSsup?: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({
    story,
    onMuteUpdate,
    isCenter,
    onNext,
    onPrevious,
    isMuted,
    onToggleMute,
    setIsTimerPaused,
    onAnalyticsStateChange,
    removeStory,
    readStory,
    subStoryIndex,
    isTimerPaused,
    duration,
    currentUserIndex,
    onMute,
    onCloseSsup,
    onReactionUpdate
}) => {
    // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
    
    // useState hooks
    const [openOption, setOpenOption] = useState(false);
    const [userMute, setUserMute] = useState(false);
    const [openStoryAnalytics, setOpenStoryAnalytics] = useState(false);
    const [interactiveData, setInteractiveData] = useState<any>(null);
    const [storyViewerList, setStoryViewerList] = useState<StoryViewer[]>([]);
    const [isEmojiHalfOpen, setIsEmojiHalfOpen] = useState(false);
    const [isEmojiFullOpen, setIsEmojiFullOpen] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState<string>("");
    const [stortReply, setStortReply] = useState<string>("");
    const [isEmojiClicked, setIsEmojiClicked] = useState(false);
    const [openReportModal, setOpenReportModal] = useState<number | null>(null);
    const [isShareOpen, setIsShareOpen] = useState<number | null>(null);
    const [currentReaction, setCurrentReaction] = useState<string>("");
    const [videoReady, setVideoReady] = useState(false);
    const [forceReload, setForceReload] = useState(0);
    const [videoUrl, setVideoUrl] = useState("");
    const [postShare, setPostShare] = useState<any>(null);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isMutedState, setIsMutedState] = useState(story?.isMuted || 0);
    const [videoLoading, setVideoLoading] = useState(false);
    const [isClickingInsideAnalytics, setIsClickingInsideAnalytics] = useState(false);

    // useRef hooks
    const videoLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Custom hooks
    const [userId] = useLocalStorage<string>('userId', '');
    const redirectUser = useUserRedirection();

    // ALL useEffect hooks MUST be here before any conditional logic
    useEffect(() => {
        if (story?.stories?.[subStoryIndex]) {
            setCurrentReaction(story.stories[subStoryIndex]?.ssupreaction || "");
        }
    }, [subStoryIndex, story]);

    useEffect(() => {
        if (story?.stories?.[subStoryIndex]?.interactiveVideo) {
            try {
                const parsedData = JSON.parse(story.stories[subStoryIndex].interactiveVideo);
                setInteractiveData(parsedData[0]);
            } catch (error) {
                console.error("Error parsing interactiveVideo:", error);
                setInteractiveData(null);
            }
        } else {
            setInteractiveData(null);
        }
    }, [story, subStoryIndex]);

    useEffect(() => {
        if (isCenter && story?.stories?.[subStoryIndex] && !story.stories[subStoryIndex].isRead) {
            const timeoutId = setTimeout(() => {
                readStory(story.stories[subStoryIndex].postId, story.userId);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [isCenter, story, subStoryIndex, readStory]);

    useEffect(() => {
        if (openOption || isEmojiHalfOpen || isEmojiFullOpen || openReportModal || isShareOpen || openStoryAnalytics) {
            setIsTimerPaused(true);
        } else {
            setIsTimerPaused(false);
        }
    }, [openOption, isEmojiHalfOpen, isEmojiFullOpen, openReportModal, isShareOpen, openStoryAnalytics, setIsTimerPaused]);

    useEffect(() => {
        const updateStoryViewCounts = async () => {
            if (story?.stories?.[subStoryIndex]?.isRead === 0) {
                try {
                    const res = await addStoryViewCounts({ storyId: story.stories[subStoryIndex]?.postId });
                } catch (error) {
                    console.error("Unexpected error in addStoryViewCounts:", error);
                }
            }
        };
        updateStoryViewCounts();
    }, [subStoryIndex, story]);

    useEffect(() => {
        if (videoLoadingTimeoutRef.current) {
            clearTimeout(videoLoadingTimeoutRef.current);
        }
        setVideoReady(false);
        setPostShare(null);

        if (story?.stories?.[subStoryIndex]) {
            const currentStory = story.stories[subStoryIndex];
            const isVideo = currentStory?.isForInteractiveVideo == 1;
            
            if (isVideo && currentStory?.interactiveVideo) {
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
                if (!isVideo && currentStory?.interactiveVideo) {
                    try {
                        const interactiveVideoArray = JSON.parse(currentStory.interactiveVideo);
                        let newPostShare = null;
                        if (interactiveVideoArray[0]?.functionality_datas?.snip_share?.snipItem) {
                            newPostShare = interactiveVideoArray[0]?.functionality_datas?.snip_share;
                        } else if (interactiveVideoArray[0]?.functionality_datas?.ssup_share?.ssupItem) {
                            newPostShare = interactiveVideoArray[0]?.functionality_datas?.ssup_share;
                        }
                        setPostShare(newPostShare);
                    } catch (error) {
                        console.error("No snipData found:", error);
                        setPostShare(null);
                    }
                }
            }
        }

        return () => {
            if (videoLoadingTimeoutRef.current) {
                clearTimeout(videoLoadingTimeoutRef.current);
            }
        };
    }, [currentUserIndex, subStoryIndex, story]);

    useEffect(() => {
        if (videoReady && videoLoadingTimeoutRef.current) {
            clearTimeout(videoLoadingTimeoutRef.current);
        }
    }, [videoReady]);

    useEffect(() => {
        const initTimer = setTimeout(() => {
            setForceReload(prev => prev + 5);
        }, 300);
        return () => clearTimeout(initTimer);
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            if (isTimerPaused) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(() => { });
            }
        }
    }, [isTimerPaused]);

    // NOW we can do early returns and validation AFTER all hooks
    if (!story || !story.stories || !Array.isArray(story.stories) || story.stories.length === 0) {
        return null;
    }

    const validSubStoryIndex = Math.max(0, Math.min(subStoryIndex, story.stories.length - 1));
    const currentStory = story.stories[validSubStoryIndex];

    if (!currentStory) {
        return null;
    }

    // Now we can safely use derived values
    const loggedInuserId = parseInt(userId!);
    const isVideo = currentStory?.isForInteractiveVideo == 1 ? true : false;
    const hasAudio = typeof currentStory?.audioFile === 'string' && currentStory.audioFile.trim() !== '';
    
    // Process audio URL safely
    let audioUrl = '';
    if (hasAudio && currentStory.audioFile) {
        audioUrl = currentStory.audioFile.replace(
            'https://d1332u4stxguh3.cloudfront.net/',
            '/audio/'
        );
        if (currentStory && typeof currentStory === 'object') {
            currentStory.audioFile = audioUrl;
        }
    }

    // Safely parse interactive videos
    let interactiveVideos: any[] = [];
    try {
        if (currentStory?.interactiveVideo) {
            interactiveVideos = JSON.parse(currentStory.interactiveVideo.toString());
        }
    } catch (error) {
        console.error("Error parsing interactiveVideo:", error);
        interactiveVideos = [];
    }

    let audio_name = interactiveVideos[0]?.audio_name || "";
    const isRandomAudioName = /^_?\d+.*\.m4a$/i.test(audio_name);
    if (isRandomAudioName) {
        audio_name = `${story.userName}'s Original Audio`;
    }

    const userInfo = {
        userId: story.userId,
        userFullName: story.userFullName,
        userProfileImage: story.userProfileImage,
        userName: story.userName,
        userMobileNo: story.userMobileNo,
        userEmail: story.userEmail,
        isVerified: story.isVerified,
        isMuted: story.isMuted
    }

    // Event handlers and other functions
    const closeAllModals = () => {
        setOpenOption(false);
        setIsEmojiHalfOpen(false);
        setIsEmojiFullOpen(false);
        setIsEmojiClicked(false);
        setOpenReportModal(null);
        setIsShareOpen(null);
    }

    const sendStoryReplyORReaction = async (replyOrReaction: number) => {
        try {
            let storyUserInfo = {
                userId: story.userId,
                userProfileImage: story.userProfileImage,
                userFullName: story.userFullName,
                userName: story.userName,
                userMobileNo: story.userMobileNo,
                userEmail: story.userEmail,
            }
            if (replyOrReaction === 0 && selectedReaction) {
                const response = await storyReaction({
                    reaction: `${selectedReaction}`,
                    storyDetails: `${JSON.stringify(currentStory)}_USERINFO_${JSON.stringify(storyUserInfo)}`,
                    storyId: currentStory.postId,
                });
            }
            if (replyOrReaction === 1 && stortReply) {
                const response = await storyReply({
                    message: stortReply,
                    storyDetails: `${JSON.stringify(currentStory)}_USERINFO_${JSON.stringify(storyUserInfo)}`,
                    storyId: currentStory.postId,
                });
            }
        } catch (error) {
        }
    };

    const handleSendReply = () => {
        if (stortReply.trim().length > 0) {
            sendStoryReplyORReaction(1);
            setStortReply("");
            setShowSnackbar(true);
            setTimeout(() => {
                setShowSnackbar(false);
            }, 3000);
        }
    };

    const handletStoryReaction = async (emoji: string) => {
        setSelectedReaction(emoji);
        setIsEmojiHalfOpen(false);
        setIsEmojiFullOpen(false);
        setIsEmojiClicked(true);
        setCurrentReaction(emoji);

        try {
            let storyUserInfo = {
                userId: story.userId,
                userProfileImage: story.userProfileImage,
                userFullName: story.userFullName,
                userName: story.userName,
                userMobileNo: story.userMobileNo,
                userEmail: story.userEmail,
            }

            const response = await storyReaction({
                reaction: emoji,
                storyDetails: `${JSON.stringify(currentStory)}_USERINFO_${JSON.stringify(storyUserInfo)}`,
                storyId: currentStory.postId,
            });

            if (response.isSuccess) {
                onReactionUpdate?.(currentStory.postId, emoji);
            }
        } catch (error) {
            console.error("Error updating reaction:", error);
        }
    };

    const handleNextSubStory = () => {
        setIsTimerPaused(false);
        closeAllModals();
        onNext();
    };

    const handlePreviousSubStory = () => {
        setIsTimerPaused(false);
        closeAllModals();
        onPrevious();
    };

    const handlePlayPause = () => {
        setIsTimerPaused(!isTimerPaused);
    }

    const handleMuteClicked = async (userId: number) => {
        try {
            const response = await muteStory({ user_id: userId });
            if (response.isSuccess) {
                setUserMute(true);
                setIsMutedState(1);
                onMuteUpdate(userId, 1);
                toast.success("Story muted successfully!");
                onMute(userId, 1);
                closeAllModals();
            } else {
                toast.error("Failed to mute the story.");
            }
        } catch (error) {
        }
    };

    const handleUnMuteClicked = async (userId: number) => {
        try {
            const response = await unMuteStory({ user_id: userId });
            if (response.isSuccess) {
                setUserMute(false);
                setIsMutedState(0);
                onMuteUpdate(userId, 0);
                onMute(userId, 0);
                toast.success("Story unmuted successfully!");
                closeAllModals();
            }
        } catch (error) {
            toast.error("Failed to unmute the story.");
        }
    };

    const handleDeleteClicked = (postId: number, userId: number, isPost: number) => {
        setSelectedPostId(postId);
        setSelectedUserId(userId);
        setShowConfirmDialog(true);
    };

    const confirmDelete = async () => {
        if (selectedPostId !== null && selectedUserId !== null) {
            try {
                const res = await deletePost({ postId: selectedPostId, isPost: 0 })
                if (res.isSuccess) {
                    removeStory(selectedPostId, selectedUserId);
                    toast.success("Ssup deleted successfully!");
                    if (subStoryIndex === story.stories.length - 1) {
                        handlePreviousSubStory();
                    }
                }
            } catch (error) {
            } finally {
                setShowConfirmDialog(false);
                setSelectedPostId(null);
                setSelectedUserId(null);
                handlePreviousSubStory();
            }
        }
    };

    const cancelDelete = () => {
        setShowConfirmDialog(false);
        setSelectedPostId(null);
        setSelectedUserId(null);
    };

    const formatTime = (timestamp: string) => {
        if (!timestamp) return '';

        const uploadDate = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - uploadDate.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) {
            return 'just now';
        } else if (diffMins < 60) {
            return `${diffMins} minutes ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return `${uploadDate.getMonth() + 1}/${uploadDate.getDate()}`;
        }
    };

    const handleOptionClick = () => {
        setOpenOption(!openOption);
    };

    const handleStoryAnalytics = async () => {
        try {
            const response = await getStoryViewerList(currentStory.postId);
            if (response.isSuccess) {
                const data = response.data;
                setStoryViewerList(response.data);
                setOpenStoryAnalytics(true);
                onAnalyticsStateChange?.(true);
            }
        } catch (error) {
            console.error("Error fetching story insights:", error);
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (openStoryAnalytics && !isClickingInsideAnalytics) {
            setOpenStoryAnalytics(false);
            onAnalyticsStateChange?.(false);
        }
    };

    const toggleAnalytics = () => {
        if (openStoryAnalytics) {
            setOpenStoryAnalytics(false);
            onAnalyticsStateChange?.(false);
        } else {
            handleStoryAnalytics();
        }
    };

    const toggleHalfEmoji = () => {
        setIsEmojiHalfOpen(!isEmojiHalfOpen);
    };
    
    const toggleFullEmoji = () => {
        setIsEmojiFullOpen(!isEmojiFullOpen);
    };


    return (
        // StoryCard Component - Responsive JSX
        <div>
            {/* Black overlay background when story is opened */}
            {isCenter && (
                <div className="fixed inset-0 z-0 bg-bg-color bg-opacity-70"></div>
            )}
            <div className="relative flex items-center justify-center w-full max-w-screen-xl mx-auto" onClick={handleCardClick}>
                <div
                    className={`relative ${isCenter
                        ? `w-[350px] h-[85vh] 
                   max-sm:w-[95vw] max-sm:h-[95vh] max-sm:max-w-[400px]
                   max-xs:w-[98vw] max-xs:h-[85vh]
                   sm:w-[350px] md:w-[350px] lg:w-[370px] xl:w-[380px]
                   z-30`
                        : `w-[250px] h-[60vh] 
                   max-lg:hidden
                   lg:w-[250px] xl:w-[270px]
                   z-20`
                        } rounded-lg transition-all mx-1 sm:mx-2 ${postShare ? 'border-2 border-gray-800' : ''}`}
                >
                    {/* Background for post share */}
                    {postShare && (
                        <div className="absolute inset-0 z-0">
                            <div
                                className="w-full h-full"
                                style={{
                                    backgroundImage: `url(${currentStory?.coverFile})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'blur(20px) brightness(1)',
                                    transform: 'scale(0.9)'
                                }}
                            ></div>
                        </div>
                    )}

                    {isCenter && (
                        <>
                            {/* Top gradient overlay - responsive */}
                            <div className="absolute top-0 left-0 right-0 
                                    h-16 sm:h-18 md:h-20 
                                    bg-gradient-to-b from-black to-transparent z-40 pointer-events-none"></div>

                            {/* Bottom gradient overlay - responsive */}
                            <div className="absolute bottom-0 left-0 right-0 
                                    h-20 sm:h-22 md:h-26 
                                    bg-gradient-to-b from-transparent to-black z-20 pointer-events-none"></div>

                            {/* Progress bars - responsive */}
                            <div className="absolute top-2 left-2 right-2 flex space-x-1 z-40 
                                    max-sm:top-3 max-sm:left-3 max-sm:right-3">
                                {story.stories.map((_, index) => (
                                    <div
                                        key={`${index}-${subStoryIndex}-${currentUserIndex}`}
                                        className={`flex-1 h-[2px] max-sm:h-[3px] rounded-full ${index < subStoryIndex ? "linearBackground" : "bg-secondary-bg-color"
                                            }`}
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
                            </div>

                            {/* User info and buttons - responsive */}
                            <div className="absolute top-0 left-0 right-0 flex items-center justify-start 
                                    px-2 py-4 z-40 
                                    max-sm:px-4 max-sm:py-5">
                                <div className="flex flex-col w-full">
                                    <div className="flex items-center space-x-2">
                                        {/* Avatar button */}
                                        <button
                                            onClick={() => redirectUser(story.userId, `/home/users/${story.userId}`)}
                                            className="focus:outline-none"
                                        >
                                            <Avatar
                                                src={story.userProfileImage}
                                                name={story.userEmail}
                                                width="w-8 sm:w-10"
                                                height="h-8 sm:h-10"
                                                isMoreBorder={false}
                                            />
                                        </button>
                                        {/* Username/time button and info line */}
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => redirectUser(story.userId, `/home/users/${story.userId}`)}
                                                className="flex items-center space-x-2 focus:outline-none"
                                            >
                                                <p className="text-white text-sm max-sm:text-base font-medium">
                                                    {loggedInuserId === story.userId ? "Your Ssup" : `@${story.userName}`}
                                                </p>
                                            </button>
                                            {/* Animated info line below username/time, only for audio and not inside a button */}
                                            {hasAudio && (
                                                <div className="flex items-center mt-1">
                                                    <AnimatedTimeAudioName
                                                        time={formatTime(story.stories[subStoryIndex]?.scheduleTime || "")}
                                                        audioName={audio_name}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>


                            </div>

                            <div className="absolute top-4 right-2 z-50 max-sm:top-8 md:hidden">
                                <button
                                    onClick={onCloseSsup}
                                    className="text-white bg-black/50 rounded-lg h-10 w-10 flex items-center justify-center"
                                >
                                    <IoClose className="text-xl" />
                                </button>
                            </div>
                            {/* Options button */}
                            <div className="absolute top-4 right-2 z-50 max-sm:top-20">
                                <button
                                    onClick={handleOptionClick}
                                    className="text-white bg-black/50 rounded-lg h-[32px] w-[32px] max-sm:h-[40px] max-sm:w-[40px] flex items-center justify-center"
                                >
                                    <FaEllipsisVertical className="text-base sm:text-lg" />
                                </button>
                            </div>

                            {/* Options dropdown */}
                            {openOption && (
                                <div className="absolute top-14 right-2 z-50 max-sm:top-[6.5rem] bg-primary-bg-color w-36 sm:w-32 shadow-lg rounded-md">
                                    {story.userId === loggedInuserId ? (
                                        <div className="flex flex-col w-full">
                                            <button
                                                className="text-red-500 hover:bg-secondary-bg-color px-3 py-1.5 text-left text-xs sm:text-sm sm:py-2"
                                                onClick={() => handleDeleteClicked(story.stories[subStoryIndex].postId, story.userId, 0)}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className="text-text-color hover:bg-secondary-bg-color px-3 py-1.5 text-left text-xs sm:text-sm sm:py-2"
                                            >
                                                Ssup Settings
                                            </button>

                                            {/* Confirmation dialog */}
                                            {showConfirmDialog && (
                                                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4 sm:px-6">
                                                    <div className="bg-primary-bg-color p-4 sm:p-6 rounded-md max-w-sm w-full">
                                                        <p className="text-sm sm:text-base text-gray-700 mb-4">
                                                            Are you sure you want to delete this Ssup? This cannot be reverted.
                                                        </p>
                                                        <div className="flex justify-end mt-4 gap-2 sm:gap-3">
                                                            <Button isLinearBtn={true} onClick={confirmDelete}>Yes</Button>
                                                            <Button isLinearBorder={true} onClick={cancelDelete}>Cancel</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col w-full">
                                            <button
                                                className="text-text-color hover:bg-secondary-bg-color px-3 py-1.5 text-left text-xs sm:text-sm sm:py-2"
                                                onClick={() => isMutedState === 1 ? handleUnMuteClicked(story.userId) : handleMuteClicked(story.userId)}
                                            >
                                                {isMutedState === 1 ? 'Unmute' : 'Mute'}
                                            </button>
                                            <button
                                                className="text-text-color hover:bg-secondary-bg-color px-3 py-1.5 text-left text-xs sm:text-sm sm:py-2"
                                                onClick={() => setOpenReportModal(currentStory.postId)}
                                            >
                                                Report
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Play/Pause button */}
                            <div className="absolute top-14 right-2 z-40 max-sm:top-[7.8rem]">
                                <button
                                    onClick={handlePlayPause}
                                    className="text-white bg-black/50 rounded-lg h-[32px] w-[32px] max-sm:h-[40px] max-sm:w-[40px] flex items-center justify-center"
                                >
                                    {isTimerPaused ? (
                                        <FaPlay className="text-white" />
                                    ) : (
                                        <FaPause className="text-white" />
                                    )}
                                </button>
                            </div>

                            {/* Mute/Unmute button */}
                            {(isVideo && !postShare || hasAudio) && (
                                <div className="absolute top-24 right-2 z-40 max-sm:top-[10.6rem]">
                                    <button
                                        onClick={onToggleMute}
                                        className="text-white bg-black/50 rounded-lg h-[32px] w-[32px] max-sm:h-[40px] max-sm:w-[40px] flex items-center justify-center"
                                    >
                                        {isMuted ? (
                                            <HiMiniSpeakerWave className="text-red-400" />
                                        ) : (
                                            <HiMiniSpeakerWave className="text-white" />
                                        )}
                                    </button>
                                </div>
                            )}


                            {/* Navigation buttons */}
                            <div className="absolute top-1/2 left-0 right-0 flex justify-between z-40">
                                <button
                                    className="relative right-6 sm:right-10 text-text-color bg-secondary-bg-color opacity-70 
                                       rounded-full z-50 p-2 max-sm:p-3 max-sm:right-4"
                                    onClick={handlePreviousSubStory}
                                >
                                    <FaChevronLeft className="max-sm:text-lg" />
                                </button>
                                <button
                                    className="relative left-6 sm:left-10 text-text-color bg-secondary-bg-color opacity-70 
                                       rounded-full z-50 p-2 max-sm:p-3 max-sm:left-4"
                                    onClick={handleNextSubStory}
                                >
                                    <FaChevronRight className="max-sm:text-lg" />
                                </button>
                            </div>
                            {isCenter && (postShare) && (
                                <div className="absolute inset-0 overflow-hidden rounded-lg z-5">
                                    {currentStory?.interactiveVideo && (
                                        <video
                                            className="w-full h-full object-cover"
                                            style={{
                                                filter: 'blur(20px) brightness(0.5)',
                                                transform: 'scale(1.2)',
                                                opacity: 0.9
                                            }}
                                            src={(() => {
                                                try {
                                                    const parsedData = JSON.parse(currentStory.interactiveVideo);
                                                    const rawPath = parsedData[0]?.path || "";
                                                    // Apply the same URL transformation you use for videoUrl
                                                    const videoPath = rawPath.replace('https://d1332u4stxguh3.cloudfront.net/', '/video/');
                                                    return videoPath;
                                                } catch (error) {
                                                    console.error("Error parsing interactiveVideo:", error);
                                                    return "";
                                                }
                                            })()}
                                            autoPlay={false}
                                            muted
                                            playsInline
                                            preload="auto"
                                            loop={false}
                                            controls={false}
                                        />
                                    )}
                                </div>
                            )}
                            {isVideo && videoUrl && !postShare ? (
                                <div
                                    ref={videoRef}
                                    className="overflow-hidden w-full h-full rounded-lg"
                                >
                                    <div className="relative w-full h-full">
                                        <ReactPlayer
                                            key={`${currentUserIndex}-${subStoryIndex}-${forceReload}`}
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
                                            <div className="absolute inset-0 flex items-center justify-center bg-primary-bg-color bg-opacity-20">
                                                <SafeImage
                                                    videoUrl={videoUrl}
                                                    src={currentStory?.coverFile}
                                                    alt="Loading"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (postShare) ? (() => {
                                return (
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ top: 0, bottom: '60px' }}>
                                        <PostInStory
                                            postShare={interactiveData?.functionality_datas?.snip_share?.snipItem ? interactiveData?.functionality_datas?.snip_share : interactiveData?.functionality_datas?.ssup_share}
                                            isTimerPaused={isTimerPaused}
                                            toggleMute={onToggleMute}
                                            isMuted={isMuted}
                                        />
                                    </div>
                                );
                            })() : (
                                <>
                                    <SafeImage
                                        onContextMenu={(e) => e.preventDefault()}
                                        src={currentStory?.coverFile}
                                        width={1000}
                                        height={1000}
                                        alt="Story content"
                                        className="w-full h-full object-contain rounded-lg"
                                    />
                                    {hasAudio && (
                                        <audio
                                            src={currentStory.audioFile}
                                            autoPlay
                                            controls={false}
                                            style={{ display: 'none' }}
                                            muted={isMuted}
                                            onEnded={handleNextSubStory}
                                            ref={audioRef}
                                        />
                                    )}
                                </>
                            )}

                            {/* Interactive elements - keep existing */}
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

                            {/* Bottom actions - responsive */}
                            <div className="absolute bottom-0 left-0 right-0 w-full flex justify-between 
                                    gap-4 sm:gap-6 md:gap-10 
                                    px-2 py-3 z-40 
                                    max-sm:px-4 max-sm:py-4">
                                {story.userId === loggedInuserId && (
                                    <div className="flex w-full justify-center items-center">
                                        <button
                                            onClick={toggleAnalytics}
                                            className="text-text-color bg-secondary-bg-color opacity-70 rounded-full z-50 h-max w-max 
                                               p-2 max-sm:p-3"
                                        >
                                            <IoIosEye className="max-sm:text-lg" />
                                        </button>
                                    </div>
                                )}
                                {story.userId != loggedInuserId && (
                                    <div className="flex space-x-2 w-full justify-between items-center
                                            max-sm:flex-col max-sm:space-x-0 max-sm:space-y-3">
                                        <div className="flex w-full items-center space-x-2 max-sm:order-2">
                                            <button
                                                onClick={toggleHalfEmoji}
                                                className="text-white bg-black/50 rounded-lg z-50
   h-[32px] w-[32px] p-2
   max-sm:h-[40px] max-sm:w-[40px] max-sm:p-2
   flex items-center justify-center flex-shrink-0"
                                            >
                                                {currentReaction ? (
                                                    <span className="text-sm max-sm:text-base">{currentReaction}</span>
                                                ) : (
                                                    <HiOutlineFaceSmile className="text-sm max-sm:text-base" />
                                                )}
                                            </button>

                                            <div className="w-full relative bg-opacity-100">
                                                <input
                                                    type="text"
                                                    name="storyReply"
                                                    placeholder="Write a message..."
                                                    className="bg-black/50 text-white placeholder-gray-300 rounded-lg border border-white h-8 max-sm:h-10 w-full px-4 max-sm:px-5 pr-12 max-sm:pr-14 text-sm max-sm:text-base focus:bg-black/50 focus:outline-none"
                                                    value={stortReply}
                                                    onChange={(e) => setStortReply(e.target.value)}
                                                />
                                                <button
                                                    onClick={handleSendReply}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2
     text-white
     rounded-full h-6 w-6 max-sm:h-7 max-sm:w-7 flex items-center justify-center"
                                                >
                                                    <IoMdSend className="text-sm max-sm:text-base" />
                                                </button>
                                            </div>
                                            <button
                                                className="text-white bg-black/50 rounded-lg z-50 h-[32px] w-[32px]
   max-sm:h-[40px] max-sm:w-[40px] flex items-center justify-center flex-shrink-0"
                                                onClick={() => { setIsShareOpen(currentStory.postId) }}
                                            >
                                                <CiShare2 className="text-base max-sm:text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Non-center story view - responsive */}
                    {!isCenter && (
                        <>
                            <SafeImage
                                onContextMenu={(e) => e.preventDefault()}
                                src={currentStory?.coverFile}
                                width={1000}
                                height={1000}
                                alt="Story of non center user"
                                className="w-full h-full object-cover rounded-lg blur-md"
                            />
                            <div className="absolute top-8 sm:top-10 w-full flex items-center gap-2 flex-col justify-center px-2">
                                <Avatar
                                    src={story.userProfileImage}
                                    name={story.userEmail}
                                    width="w-12 sm:w-14"
                                    height="h-12 sm:h-14"
                                    isMoreBorder={false}
                                />
                                <h2 className="text-text-color text-xs sm:text-sm font-medium text-center">
                                    {story.userFullName}
                                </h2>
                            </div>
                        </>
                    )}


                    {/* Story Analytics - keep existing */}
                    {story.userId === loggedInuserId && openStoryAnalytics && (
                        <StoryAnalytics
                            storyId={story.stories[subStoryIndex]?.postId}
                            storyViewerList={storyViewerList}
                            onClose={() => {
                                setOpenStoryAnalytics(false);
                                onAnalyticsStateChange?.(false);
                            }}
                            onMouseEnter={() => setIsClickingInsideAnalytics(true)}
                            onMouseLeave={() => setIsClickingInsideAnalytics(false)}
                        />
                    )}

                    {/* Half Emoji UI - responsive and centered */}
                    {isEmojiHalfOpen && story.userId !== loggedInuserId && (
                        <div className="absolute bottom-[7%] left-1/2 transform -translate-x-1/2 z-60 bg-transparent">
                            <HalfEmojiUi
                                onClose={toggleHalfEmoji}
                                onOpenFullEmojiUi={toggleFullEmoji}
                                handletStoryReaction={handletStoryReaction}
                                currentReaction={currentReaction}
                            />
                        </div>
                    )}

                    {/* Full Emoji UI - responsive and centered */}
                    {isEmojiFullOpen && story.userId !== loggedInuserId && (
                        <div className="absolute bottom-[7%] left-1/2 transform -translate-x-1/2 z-60 bg-transparent">
                            <FullEmojiUi
                                onClose={toggleFullEmoji}
                                handletStoryReaction={handletStoryReaction}
                                currentReaction={currentReaction}
                            />
                        </div>
                    )}

                    {/* Emoji animation - keep existing */}
                    {isEmojiClicked && story.userId != loggedInuserId && <EmojiAnimation emoji={selectedReaction} />}

                    {/* Modals - keep existing */}
                    {openReportModal && <ReportModal postId={story.userId} onClose={() => { setOpenReportModal(null) }} />}
                    {isShareOpen && <SharePostModal data={currentStory} userInfo={userInfo} type={5} postId={currentStory.postId} onClose={() => { setIsShareOpen(null) }} />}

                    {/* Snackbar - responsive */}
                    {showSnackbar && (
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
                                max-sm:bottom-12 bg-primary-bg-color text-text-color 
                                px-4 py-2 max-sm:px-6 max-sm:py-3 rounded-lg z-60 
                                transition-opacity duration-200 text-sm max-sm:text-base">
                            Message Sent
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const AnimatedTimeAudioName = ({ time, audioName }: { time: string, audioName: string }) => {
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
            {/* Time */}
            <span
                className={`transition-opacity duration-300 whitespace-nowrap absolute left-0 top-0 w-full flex items-center gap-1 ${showTime && fade ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ height: '100%' }}
            >
                <span className="text-white text-xs max-sm:text-sm opacity-75 whitespace-nowrap">{time}</span>
            </span>
            {/* Audio name with icon */}
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

export default StoryCard;
