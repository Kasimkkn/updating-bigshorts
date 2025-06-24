import useLocalStorage from "@/hooks/useLocalStorage";
import { StoryData } from "@/types/storyTypes";
import React, { useEffect, useRef, useState } from "react";
import ReportModal from "../modal/ReportModal";
import SharePostModal from "../modal/SharePostModal";
import SafeImage from "../shared/SafeImage";
import PostInStory from "./PostInStory";
import EmojiAnimation from "./shared/EmojiAnimation";
import { FullEmojiUi, HalfEmojiUi } from "./shared/EmojiUi";
import { StoryBottomActions } from "./shared/StoryBottomActions";
import { StoryControls } from "./shared/StoryControls";
import { StoryHeader } from "./shared/StoryHeader";
import { StoryInteractiveElements } from "./shared/StoryInteractiveElements";
import { StoryNavigation } from "./shared/StoryNavigation";
import { StoryOptionsDropdown } from "./shared/StoryOptionsDropdown";
import { StoryProgressBar } from "./shared/StoryProgressBar";
import { StoryVideoPlayer } from "./shared/StoryVideoPlayer";
import StoryAnalytics from "./StoryAnalytics";

// Services
import { useVideoPlayer } from "@/components/story/shared/useVideoPlayer";
import { addStoryViewCounts } from "@/services/addstoryviewcounts";
import { formatTime } from "@/components/story/shared/storyUtils";
import Avatar from "../Avatar/Avatar";
import { useStoryActions } from "./shared/useStoryActions";
import { useStoryData } from "./shared/useStoryData";

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
    // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [userId] = useLocalStorage<string>('userId', '');

    // Custom hooks - ALWAYS call these
    const storyData = useStoryData({ story, subStoryIndex });
    const { currentStory, isVideo, hasAudio, audioUrl, audioName, interactiveData, postShare } = storyData;

    const videoPlayerData = useVideoPlayer({
        interactiveVideo: currentStory?.interactiveVideo,
        currentStoryIndex: subStoryIndex,
        currentUserIndex
    });

    const loggedInuserId = parseInt(userId || '0');

    const userInfo = {
        userId: story?.userId || 0,
        userFullName: story?.userFullName || '',
        userProfileImage: story?.userProfileImage || '',
        userName: story?.userName || '',
        userMobileNo: story?.userMobileNo || '',
        userEmail: story?.userEmail || '',
        isVerified: story?.isVerified || false,
        isMuted: story?.isMuted || 0
    };

    // Actions hook - ALWAYS call this
    const {
        storyViewerList,
        isMutedState,
        handleStoryReaction,
        handleStoryReply,
        handleMute,
        handleUnmute,
        handleDelete,
        handleAnalytics
    } = useStoryActions({
        story,
        currentStory,
        userInfo,
        onReactionUpdate,
        onMuteUpdate,
        removeStory,
        onAnalyticsStateChange,
        onMute,
        onPrevious,
        subStoryIndex
    });

    // All useState hooks
    const [openOption, setOpenOption] = useState(false);
    const [openStoryAnalytics, setOpenStoryAnalytics] = useState(false);
    const [isEmojiHalfOpen, setIsEmojiHalfOpen] = useState(false);
    const [isEmojiFullOpen, setIsEmojiFullOpen] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState<string>("");
    const [storyReplyText, setStoryReplyText] = useState<string>("");
    const [isEmojiClicked, setIsEmojiClicked] = useState(false);
    const [openReportModal, setOpenReportModal] = useState<number | null>(null);
    const [isShareOpen, setIsShareOpen] = useState<number | null>(null);
    const [currentReaction, setCurrentReaction] = useState<string>("");
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isClickingInsideAnalytics, setIsClickingInsideAnalytics] = useState(false);

    // All useEffect hooks
    useEffect(() => {
        setCurrentReaction(currentStory?.ssupreaction || "");
    }, [subStoryIndex, currentStory]);

    useEffect(() => {
        const hasOpenModal = Boolean(openOption || isEmojiHalfOpen || isEmojiFullOpen ||
            openReportModal || isShareOpen || openStoryAnalytics);
        setIsTimerPaused(hasOpenModal);
    }, [openOption, isEmojiHalfOpen, isEmojiFullOpen, openReportModal, isShareOpen, openStoryAnalytics, setIsTimerPaused]);

    useEffect(() => {
        if (isCenter && currentStory && !currentStory.isRead) {
            const timeoutId = setTimeout(() => {
                readStory(currentStory.postId, story.userId);
                addStoryViewCounts({ storyId: currentStory.postId }).catch(console.error);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [isCenter, currentStory, readStory, story?.userId]);

    useEffect(() => {
        if (audioRef.current) {
            if (isTimerPaused) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(() => { });
            }
        }
    }, [isTimerPaused]);

    // NOW we can do validation AFTER all hooks have been called
    if (!story?.stories?.length || subStoryIndex >= story.stories.length || !currentStory) {
        return null;
    }

    // Event handlers
    const closeAllModals = () => {
        setOpenOption(false);
        setIsEmojiHalfOpen(false);
        setIsEmojiFullOpen(false);
        setIsEmojiClicked(false);
        setOpenReportModal(null);
        setIsShareOpen(null);
    };

    const handleReactionClick = async (emoji: string) => {
        setSelectedReaction(emoji);
        setIsEmojiHalfOpen(false);
        setIsEmojiFullOpen(false);
        setIsEmojiClicked(true);
        setCurrentReaction(emoji);
        await handleStoryReaction(emoji);
    };

    const handleSendReply = async () => {
        if (storyReplyText.trim().length > 0) {
            await handleStoryReply(storyReplyText);
            setStoryReplyText("");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 3000);
        }
    };

    const handleDeleteClick = (postId: number, userId: number) => {
        setSelectedPostId(postId);
        setSelectedUserId(userId);
        setShowConfirmDialog(true);
    };

    const confirmDelete = async () => {
        if (selectedPostId && selectedUserId) {
            await handleDelete(selectedPostId, selectedUserId);
            setShowConfirmDialog(false);
            setSelectedPostId(null);
            setSelectedUserId(null);
        }
    };

    const handleAnalyticsClick = async () => {
        if (openStoryAnalytics) {
            setOpenStoryAnalytics(false);
            onAnalyticsStateChange?.(false);
        } else {
            const success = await handleAnalytics();
            if (success) {
                setOpenStoryAnalytics(true);
            }
        }
    };

    // Content rendering
    const renderStoryContent = () => {
        if (postShare) {
            return (
                <div className="absolute inset-0 flex items-center justify-center" style={{ top: 0, bottom: '60px' }}>
                    <PostInStory
                        postShare={postShare}
                        isTimerPaused={isTimerPaused}
                        toggleMute={onToggleMute}
                        isMuted={isMuted}
                    />
                </div>
            );
        }

        if (isVideo && videoPlayerData.videoUrl) {
            return (
                <StoryVideoPlayer
                    {...videoPlayerData}
                    isTimerPaused={isTimerPaused}
                    isMuted={isMuted}
                    coverFile={currentStory?.coverFile}
                    currentUserIndex={currentUserIndex}
                    currentStoryIndex={subStoryIndex}
                    onVideoReady={() => videoPlayerData.setVideoReady(true)}
                    onError={(e) => {
                        console.error("Video error:", e);
                        setTimeout(() => videoPlayerData.setVideoReady(false), 500);
                    }}
                />
            );
        }

        return (
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
                        src={audioUrl}
                        autoPlay
                        controls={false}
                        style={{ display: 'none' }}
                        muted={isMuted}
                        onEnded={onNext}
                        ref={audioRef}
                    />
                )}
            </>
        );
    };

    return (
        <div>
            {isCenter && <div className="fixed inset-0 z-0 bg-bg-color bg-opacity-70" />}

            <div className="relative flex items-center justify-center w-full max-w-screen-xl mx-auto"
                onClick={(e) => {
                    if (openStoryAnalytics && !isClickingInsideAnalytics) {
                        setOpenStoryAnalytics(false);
                        onAnalyticsStateChange?.(false);
                    }
                }}>

                <div className={`relative ${isCenter
                    ? 'w-[350px] h-[85vh] max-sm:w-[95vw] max-sm:h-[95vh] max-sm:max-w-[400px] z-30'
                    : 'w-[250px] h-[60vh] max-lg:hidden z-20'
                    } rounded-lg transition-all mx-1 sm:mx-2 ${postShare ? 'border-2 border-gray-800' : ''}`}>

                    {/* Background for post share */}
                    {postShare && (
                        <div className="absolute inset-0 z-0">
                            <div className="w-full h-full" style={{
                                backgroundImage: `url(${currentStory?.coverFile})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(20px) brightness(1)',
                                transform: 'scale(0.9)'
                            }} />
                        </div>
                    )}

                    {isCenter ? (
                        <>
                            {/* Gradient overlays */}
                            <div className="absolute top-0 left-0 right-0 h-16 sm:h-18 md:h-20 bg-gradient-to-b from-black to-transparent z-40 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-22 md:h-26 bg-gradient-to-b from-transparent to-black z-20 pointer-events-none" />

                            {/* Story components */}
                            <StoryProgressBar
                                stories={story.stories}
                                currentIndex={subStoryIndex}
                                duration={duration}
                                isTimerPaused={isTimerPaused}
                                currentUserIndex={currentUserIndex}
                            />

                            <StoryHeader
                                userProfileImage={story.userProfileImage}
                                userEmail={story.userEmail}
                                userName={story.userName}
                                userId={story.userId}
                                loggedInUserId={loggedInuserId}
                                time={hasAudio ? formatTime(currentStory?.scheduleTime || "") : undefined}
                                audioName={hasAudio ? audioName : undefined}
                                hasAudio={hasAudio}
                            />

                            <StoryControls
                                onOptionsClick={() => setOpenOption(!openOption)}
                                onPlayPause={() => setIsTimerPaused(!isTimerPaused)}
                                onToggleMute={onToggleMute}
                                onClose={onCloseSsup}
                                isTimerPaused={isTimerPaused}
                                isMuted={isMuted}
                                showMuteButton={(isVideo && !postShare) || hasAudio}
                                showCloseButton={true}
                                isMobile={true}
                            />

                            <StoryNavigation
                                onPrevious={() => {
                                    setIsTimerPaused(false);
                                    closeAllModals();
                                    onPrevious();
                                }}
                                onNext={() => {
                                    setIsTimerPaused(false);
                                    closeAllModals();
                                    onNext();
                                }}
                            />

                            <StoryOptionsDropdown
                                isVisible={openOption}
                                isOwner={story.userId === loggedInuserId}
                                isMuted={isMutedState}
                                onDelete={() => handleDeleteClick(currentStory.postId, story.userId)}
                                onMute={() => handleMute(story.userId)}
                                onUnmute={() => handleUnmute(story.userId)}
                                onReport={() => setOpenReportModal(currentStory.postId)}
                                showConfirmDialog={showConfirmDialog}
                                onConfirmDelete={confirmDelete}
                                onCancelDelete={() => {
                                    setShowConfirmDialog(false);
                                    setSelectedPostId(null);
                                    setSelectedUserId(null);
                                }}
                            />

                            {/* Story content */}
                            {renderStoryContent()}

                            <StoryInteractiveElements
                                interactiveData={interactiveData}
                                duration={duration}
                            />

                            <StoryBottomActions
                                isOwner={story.userId === loggedInuserId}
                                onAnalyticsClick={handleAnalyticsClick}
                                onEmojiClick={() => setIsEmojiHalfOpen(!isEmojiHalfOpen)}
                                onShareClick={() => setIsShareOpen(currentStory.postId)}
                                replyValue={storyReplyText}
                                onReplyChange={setStoryReplyText}
                                onSendReply={handleSendReply}
                                currentReaction={currentReaction}
                            />

                            {/* Modals and overlays */}
                            {story.userId === loggedInuserId && openStoryAnalytics && (
                                <StoryAnalytics
                                    storyId={currentStory.postId}
                                    storyViewerList={storyViewerList}
                                    onClose={() => {
                                        setOpenStoryAnalytics(false);
                                        onAnalyticsStateChange?.(false);
                                    }}
                                    onMouseEnter={() => setIsClickingInsideAnalytics(true)}
                                    onMouseLeave={() => setIsClickingInsideAnalytics(false)}
                                />
                            )}

                            {/* Emoji UIs */}
                            {isEmojiHalfOpen && story.userId !== loggedInuserId && (
                                <div className="absolute bottom-[7%] left-1/2 transform -translate-x-1/2 z-60 bg-transparent">
                                    <HalfEmojiUi
                                        onClose={() => setIsEmojiHalfOpen(false)}
                                        onOpenFullEmojiUi={() => {
                                            setIsEmojiFullOpen(true);
                                            setIsEmojiHalfOpen(false);
                                        }}
                                        handletStoryReaction={handleReactionClick}
                                        currentReaction={currentReaction}
                                    />
                                </div>
                            )}

                            {isEmojiFullOpen && story.userId !== loggedInuserId && (
                                <div className="absolute bottom-[7%] left-1/2 transform -translate-x-1/2 z-60 bg-transparent">
                                    <FullEmojiUi
                                        onClose={() => setIsEmojiFullOpen(false)}
                                        handletStoryReaction={handleReactionClick}
                                        currentReaction={currentReaction}
                                    />
                                </div>
                            )}

                            {isEmojiClicked && story.userId !== loggedInuserId && (
                                <EmojiAnimation emoji={selectedReaction} />
                            )}

                            {/* Other modals */}
                            {openReportModal && (
                                <ReportModal
                                    postId={story.userId}
                                    onClose={() => setOpenReportModal(null)}
                                />
                            )}

                            {isShareOpen && (
                                <SharePostModal
                                    data={currentStory}
                                    userInfo={userInfo}
                                    type={5}
                                    postId={currentStory.postId}
                                    onClose={() => setIsShareOpen(null)}
                                />
                            )}

                            {showSnackbar && (
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-sm:bottom-12 bg-primary-bg-color text-text-color px-4 py-2 max-sm:px-6 max-sm:py-3 rounded-lg z-60 transition-opacity duration-200 text-sm max-sm:text-base">
                                    Message Sent
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <SafeImage
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
                </div>
            </div>
        </div>
    );
}

export default StoryCard;
