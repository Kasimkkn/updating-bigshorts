"use client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { PostlistItem } from "@/models/postlistResponse";
import { flixCommentList } from "@/services/flixcommentlist";
import { getFlixDetails } from "@/services/getflixdetails";
import { PostCommentListResponse } from "@/services/postcommentlist";
import { saveFlixComment } from "@/services/saveflixcomment";
import { saveFlixCommentLike } from "@/services/saveflixcommentlike";
import { saveFlixLike } from "@/services/saveflixlike";
import { saveOtherFlix } from "@/services/saveotherflix";
import { getDateHeader } from "@/utils/features";
import useUserRedirection from "@/utils/userRedirection";
import { useEffect, useRef, useState } from "react";
import { FaBookmark, FaEye, FaRegBookmark } from "react-icons/fa";
import { IoSendSharp, IoStarOutline, IoStarSharp } from "react-icons/io5";
import { MdOutlineComment } from "react-icons/md";
import { PiPaperPlaneTilt } from "react-icons/pi";
import { TiPinOutline } from "react-icons/ti";
import Avatar from "../Avatar/Avatar";
import EllipsisMenu from "../CommentUi/EllipsisMenu";
import CustomVideoPlayer from "../CustomFlixVideoPlayer/CustomFlixVideoPlayer";
import FollowButton from "../FollowButton/FollowButton";
import Button from "../shared/Button";
import ReportModal from "./ReportModal";
import SharePostModal from "./SharePostModal";

const FlixVideoModal = ({ flix: initialFlix, setSingleFlixDataModel, showMobileComments, setShowMobileComments }: {
    flix: PostlistItem,
    setSingleFlixDataModel: React.Dispatch<React.SetStateAction<PostlistItem | null>>
    showMobileComments: boolean
    setShowMobileComments: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const [flix, setFlix] = useState<PostlistItem>(initialFlix);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [storedUserData] = useLocalStorage<any>('userData', {});
    const loggedUserData = storedUserData || {};
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [commentsData, setCommentsData] = useState<PostCommentListResponse[]>([]);
    const [commentReply, setCommentReply] = useState<string>('');
    const [isSharingVideo, setIsSharingVideo] = useState<boolean>(false);
    const [isCommentsMenuOpen, setIsCommentsMenuOpen] = useState<{ commentId: number, replyId: number } | null>(null);
    const [openReportModal, setOpenReportModal] = useState<{ commentId: number, replyId: number } | null>(null);
    const [replyingToCommentId, setReplyingToCommentId] = useState<number>(0); //zero for original comment
    const [replyingToUsername, setReplyingToUsername] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
    const [visibleRepliesCount, setVisibleRepliesCount] = useState<Record<number, number>>({});
    const REPLIES_PER_LOAD = 10;
    const [post, setPosts] = useState<PostlistItem[]>([]);
    const redirectUser = useUserRedirection();
    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;
    const alreadyFetchedPostIds = useRef(new Set<number>());
    const [showFullDescription, setShowFullDescription] = useState(false);
    const truncate = (text: string, limit: number) =>
        text.length > limit ? text.slice(0, limit) + '...' : text;

    // Extract and set video URL from flix data
    useEffect(() => {
        if (!flix?.interactiveVideo) return;

        try {
            const interactiveVideos = typeof flix.interactiveVideo === 'string'
                ? JSON.parse(flix.interactiveVideo.toString())
                : flix.interactiveVideo;

            const rawVideoPath = interactiveVideos[0]?.path || "";
            if (rawVideoPath) {
                const newVideoUrl = rawVideoPath.replace(
                    "https://d1332u4stxguh3.cloudfront.net/",
                    "/video/"
                );

                if (newVideoUrl !== videoUrl) {
                    setVideoUrl(newVideoUrl);
                }
            }
        } catch (error) {
            console.error("Error parsing interactive video:", error);
        }
    }, [flix, videoUrl]);

    // Fetch full flix details from API - but only once per video
    useEffect(() => {
        const fetchFlixDetails = async () => {
            if (!initialFlix?.postId || !userId) return;

            // Skip if we've already fetched this post
            if (alreadyFetchedPostIds.current.has(initialFlix.postId)) {
                return;
            }

            // Mark this post as fetched to prevent duplicate API calls
            alreadyFetchedPostIds.current.add(initialFlix.postId);

            setIsLoading(true);
            try {
                const response = await getFlixDetails(initialFlix.postId, userId);

                if (response.isSuccess && response.data && response.data.length > 0) {
                    const detailedFlix = response.data[0];

                    // Merge with original data for important properties
                    const mergedFlix = {
                        ...detailedFlix,
                    };

                    setFlix(mergedFlix);
                    setSingleFlixDataModel(mergedFlix);
                } else {
                    setError("Failed to fetch video details");
                }
            } catch (error) {
                console.error("Error fetching flix details:", error);
                setError("Error loading video");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFlixDetails();
    }, [initialFlix?.postId, userId, setSingleFlixDataModel]);

    useEffect(() => {
        if (flix?.postId) {
            getCommentsData();
        }
    }, [flix?.postId]);


    const getCommentsData = async () => {
        try {
            if (!flix?.postId) return;

            const response = await flixCommentList({ postId: flix.postId });
            if (response.isSuccess) {
                setCommentsData(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const likeTheFlix = async (postId: number) => {
        try {
            if (!postId) return;

            const currentFlix = flix;
            if (!currentFlix) return;

            const isCurrentlyLiked = currentFlix.isLiked || currentFlix.isSuperLiked;
            const newLikeState = isCurrentlyLiked ? 0 : 1;

            setFlix(prev => ({
                ...prev,
                isLiked: newLikeState,
                likeCount: prev.likeCount + (newLikeState ? 1 : -1)
            }));

            setSingleFlixDataModel(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    isLiked: newLikeState,
                    likeCount: prev.likeCount + (newLikeState ? 1 : -1)
                };
            });

            const res = await saveFlixLike({
                postId,
                isLike: newLikeState
            });

            if (!res.isSuccess) {
                // Revert changes if API call fails
                setFlix(prev => ({
                    ...prev,
                    isLiked: isCurrentlyLiked ? 1 : 0,
                    likeCount: prev.likeCount + (isCurrentlyLiked ? 1 : -1)
                }));

                setSingleFlixDataModel(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        isLiked: isCurrentlyLiked ? 1 : 0,
                        likeCount: prev.likeCount + (isCurrentlyLiked ? 1 : -1)
                    };
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const shareFlix = (postId: number, property: string, increaseCount: number) => {
        setFlix(prev => ({
            ...prev,
            saveCount: prev.saveCount + increaseCount
        }));

        setSingleFlixDataModel(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                saveCount: prev.saveCount + increaseCount
            };
        });
    }

    const updateComments = (property: string, commentId: number, replyId: number) => {
        if (property === 'delete') {
            if (replyId === 0) {
                setCommentsData((prev) =>
                    prev.filter((comment) => comment.commentId !== commentId)
                );
            }
            else {
                setCommentsData((prev) =>
                    prev.map((comment) => {
                        if (comment.commentId === commentId && comment.replyData) {
                            return {
                                ...comment,
                                replyData: comment.replyData.filter(reply => reply.replyId !== replyId)
                            };
                        }
                        return comment;
                    })
                );
            }
        }
        else if (property === 'pin') {
            getCommentsData();
        }
        else if (property === 'report') {
            setOpenReportModal({ commentId, replyId });
        }

    }

    const handleReply = (commentId: number, username: string) => {
        setReplyingToCommentId(commentId);
        setReplyingToUsername(username);
        inputRef.current?.focus();
    };

    const cancelReply = () => {
        setReplyingToCommentId(0);
        setReplyingToUsername("");
        setCommentReply("");
    };

    const toggleReplies = (commentId: number, replyCount: number) => {
        setExpandedComments(prev => {
            const isCurrentlyExpanded = !!prev[commentId];

            // If collapsing, reset visible count. If expanding, show initial batch
            setVisibleRepliesCount(prev => ({
                ...prev,
                [commentId]: isCurrentlyExpanded ? 0 : REPLIES_PER_LOAD
            }));

            return {
                ...prev,
                [commentId]: !isCurrentlyExpanded
            };
        });
    };

    const loadMoreReplies = (commentId: number, totalReplies: number) => {
        setVisibleRepliesCount(prev => ({
            ...prev,
            [commentId]: Math.min((prev[commentId] || 0) + REPLIES_PER_LOAD, totalReplies)
        }));
    };

    const handleCloseCommentsMenu = () => {
        setIsCommentsMenuOpen(null)
    }

    const handleShareVideo = () => {
        setIsSharingVideo(!isSharingVideo);
    };

    const handleSave = async (postId: number) => {
        try {
            if (!postId) return;

            // Get the current flix data
            const currentFlix = flix;
            if (!currentFlix) return;

            // Determine the current and new save state
            const isCurrentlySaved = currentFlix.isSaved;
            const newSaveState = isCurrentlySaved ? 0 : 1;

            // Optimistically update the state
            setFlix(prev => ({
                ...prev,
                isSaved: newSaveState
            }));

            setSingleFlixDataModel(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    isSaved: newSaveState
                };
            });

            // Call the API to save/unsave the flix
            const res = await saveOtherFlix({
                postId,
                isSave: isCurrentlySaved
            });

            if (!res.isSuccess) {

                // If the API call fails, revert the changes
                setFlix(prev => ({
                    ...prev,
                    isSaved: isCurrentlySaved ? 1 : 0
                }));

                setSingleFlixDataModel(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        isSaved: isCurrentlySaved ? 1 : 0
                    };
                });
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const sendComments = async () => {
        try {
            if (!flix?.postId || !commentReply.trim()) return;

            const response = await saveFlixComment({
                postId: flix.postId,
                comment: commentReply,
                commentId: replyingToCommentId,
            });

            if (response.isSuccess) {
                setCommentReply('');
                setReplyingToCommentId(0);
                setReplyingToUsername('');
                getCommentsData();
            }
        } catch (error) {
            console.error('Error sending comment:', error);
        }
    };



    const handleCommentLike = async (commentId: number, replyId: number, isLike: number) => {
        try {
            if (!flix?.postId) return;

            const response = await saveFlixCommentLike({
                commentId,
                isLike,
                postId: flix.postId,
                replyId
            });

            if (response.isSuccess) {
                setCommentsData((prev) =>
                    prev.map((comment) => {
                        if (comment.commentId !== commentId) return comment;

                        // If it's a reply
                        if (replyId !== 0) {
                            const updatedReplyData = comment.replyData.map((reply: any) =>
                                reply.replyId === replyId
                                    ? {
                                        ...reply,
                                        isCommentReplyLiked: isLike,
                                        commentReplyLikeCount:
                                            isLike === 1 ? reply.commentReplyLikeCount + 1 : reply.commentReplyLikeCount - 1,
                                    }
                                    : reply
                            );

                            return {
                                ...comment,
                                replyData: updatedReplyData,
                            };
                        }

                        // If it's a main comment
                        return {
                            ...comment,
                            isCommentLiked: isLike,
                            commentLikeCount:
                                isLike === 1 ? comment.commentLikeCount + 1 : comment.commentLikeCount - 1,
                        };
                    })
                );
            }
        } catch (error) {
            console.error('Error liking the comment:', error);
        }
    };

    // Simple loading state
    if (isLoading && !videoUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // Simple error state
    if (error && !flix) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    // Show placeholder if no flix data
    if (!flix) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-xl">No video selected</p>
            </div>
        );
    }

    return (
        <>
            <div className="w-full h-full flex flex-col">
                {/* Video player and fixed details */}
                <div className="flex-shrink-0">
                    <CustomVideoPlayer
                        src={videoUrl}
                        videoId={flix.postId}
                    />

                    <div className="flex flex-col w-full py-4 md:p-4 relative border-b border-b-border-color">
                        <h1 className="text-xl font-bold">{flix.postTitle}</h1>
                        <p className="max-md:hidden text-sm text-primary-text-color">
                            {flix.viewCounts} Views · {getDateHeader(flix.scheduleTime)}
                        </p>

                        {/* Description with More/Less */}
                        {flix.description && <h1 className="mt-4">Description:</h1>}
                        {flix.description && <div className="bg-bg-color text-sm text-text-color opacity-[70%] rounded">

                            {showFullDescription ? flix.description : truncate(flix.description, 150)}
                            {flix.description && flix.description.length > 150 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="linearText ml-1"
                                >
                                    {showFullDescription ? 'Show less' : '...more'}
                                </button>
                            )}
                        </div>}

                        <div className="flex max-md:flex-col justify-between items-center w-full">
                            <div className="max-md:order-2 flex justify-between md:items-center gap-4 mt-4 min-w-0 max-md:w-full">
                                <button
                                    onClick={() => {
                                        redirectUser(flix.userId, `/home/users/${flix.userId}`)
                                    }}
                                    className='flex items-center gap-1 flex-1 min-w-0'
                                >
                                    <Avatar src={flix.userProfileImage} name={flix.userFullName || flix.userName} />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <h2 className="font-semibold truncate text-start">
                                            {flix.userFullName}
                                        </h2>
                                        <p className="text-start ">{flix.userName ? `@${flix.userName}` : '\u00A0'}</p>
                                    </div>
                                </button>
                                <FollowButton requestId={flix.userId} isFollowing={flix.isFriend} />
                            </div>

                            <div className="max-md:order-1 flex justify-between md:items-center gap-2 mt-4 max-md:w-full">
                                <button
                                    onClick={() => likeTheFlix(flix.postId)}
                                    className="flex items-center gap-2 text-primary-text-color"
                                >
                                    {flix.isLiked ? (
                                        <IoStarSharp className="text-4xl p-2 text-yellow-500" />
                                    ) : (
                                        <IoStarOutline className="text-4xl p-2 hover:text-yellow-500" />
                                    )} {flix.likeCount}
                                </button>

                                <button
                                    onClick={() => setShowMobileComments(true)}
                                    className="md:hidden flex items-center gap-2 text-primary-text-color"
                                >
                                    <MdOutlineComment />
                                    <p className="text-sm text-primary-text-color">
                                        {flix.commentCount}
                                    </p>
                                </button>

                                <button onClick={handleShareVideo} className="flex items-center gap-2 text-primary-text-color">
                                    <PiPaperPlaneTilt />
                                    <p className="hidden md:block">Share</p>
                                </button>
                                <span className="md:hidden flex items-center gap-2 text-primary-text-color">
                                    <FaEye />
                                    {flix.viewCounts} Views
                                </span>
                                <button onClick={() => handleSave(flix.postId)} className="flex items-center gap-2 text-primary-text-color">
                                    {!flix.isSaved ? <FaRegBookmark /> : <FaBookmark />}
                                    <p className="hidden md:block">Save</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable comments section */}
                <div className="max-md:hidden flex-grow overflow-y-auto md:block">
                    <div className="p-4 bg-bg-color text-text-color">
                        <h3 className="text-lg font-semibold">Comments</h3>
                        <div className="mt-4">
                            <div className="flex items-center gap-2 md:gap-4 z-10">
                                <Avatar src={loggedUserData?.userProfileImage} name={loggedUserData?.userFullName} />
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={commentReply}
                                        onChange={(e) => setCommentReply(e.target.value)}
                                        ref={inputRef}
                                        className="flex-1 w-full bg-primary-bg-color rounded-full px-4 py-2 text-sm text-text-color focus:outline-none focus:ring-1 focus:ring-border-color"
                                    />
                                    {replyingToCommentId !== 0 && (
                                        <div className="absolute flex w-full items-center justify-between px-3 py-2 bg-bg-color border border-border-color">
                                            <div className="text-sm text-text-color">
                                                Replying to <span className="font-semibold">{replyingToUsername}</span>
                                            </div>
                                            <button
                                                onClick={cancelReply}
                                                className="text-text-color hover:text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    isLinearBtn={true}
                                    className="rounded-full"
                                    onClick={sendComments}
                                >
                                    <p className="hidden md:block">Comment</p>
                                    <IoSendSharp className="md:hidden" />
                                </Button>
                            </div>

                            <div className="mt-4 space-y-4">
                                {commentsData.map((data, index) => (
                                    <div key={index + 1} className="flex flex-col p-2 rounded-lg bg-primary-bg-color mb-2">
                                        {data.is_pin === 1 && (
                                            <div className="flex w-full pl-10 mb-1">
                                                <TiPinOutline />
                                                <span className="text-xs"> Pinned by {flix.userFullName ? flix.userFullName : flix.userName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Avatar src={data.userProfileImage} name={data.userName} />
                                                <span className="font-bold text-sm">{data.userName}</span>
                                            </div>
                                            <button
                                                onClick={() => handleCommentLike(data.commentId, 0, data.isCommentLiked ? 0 : 1)}
                                                className="text-text-color"
                                                aria-label="Like Comment"
                                            >
                                                {data.isCommentLiked ? (
                                                    <IoStarSharp className="text-4xl p-2 text-yellow-500" />
                                                ) : (
                                                    <IoStarOutline className="text-4xl p-2 hover:text-yellow-500" />
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-sm pl-11">{data.comment}</p>

                                        <div className="flex items-center text-xs pl-11 text-text-color mt-2">
                                            <span className="mr-3">{data.commentDays}</span>
                                            {data.commentLikeCount > 0 && <span className="mr-3">{data.commentLikeCount} {data.commentLikeCount === 1 ? 'like' : 'likes'}</span>}
                                            <button className="mr-3" onClick={() => handleReply(data.commentId, data.userName)}>Reply</button>
                                            <button className="text-text-color relative" aria-label="More Options" onClick={() => setIsCommentsMenuOpen({ commentId: data.commentId, replyId: 0 })}>
                                                •••
                                                {isCommentsMenuOpen?.commentId === data.commentId && isCommentsMenuOpen?.replyId === 0 && (
                                                    <EllipsisMenu onClose={handleCloseCommentsMenu} data={data} isLoggedInPostOwner={flix.userId === userId} updateComments={updateComments} isFlix={true} />
                                                )}
                                            </button>
                                        </div>

                                        {data.replyData && data.replyData.length > 0 && (
                                            <div className="ml-11 mt-2">
                                                {/* View replies button */}
                                                <button
                                                    onClick={() => toggleReplies(data.commentId, data.replyData.length)}
                                                    className="text-xs text-primary-text-color hover:underline flex items-center gap-1 mb-1"
                                                >
                                                    <div className="w-5 h-px bg-primary-text-color"></div>
                                                    {expandedComments[data.commentId]
                                                        ? "Hide replies"
                                                        : `View ${data.replyData.length} ${data.replyData.length === 1 ? 'reply' : 'replies'}`}
                                                </button>

                                                {expandedComments[data.commentId] &&
                                                    <>
                                                        {/* Show replies */}
                                                        {data.replyData.slice(0, visibleRepliesCount[data.commentId] || REPLIES_PER_LOAD).map((reply, replyIndex) => (
                                                            <div key={replyIndex} className="flex flex-col p-1 rounded-lg mb-1 relative">
                                                                <div className="flex items-center justify-between">
                                                                    <button
                                                                        onClick={() => {
                                                                            redirectUser(reply.userId, `/home/users/${reply.userId}`)
                                                                        }}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Avatar name={reply.userName} src={reply.userProfileImage} />
                                                                        <span className="font-bold text-xs">{reply.userName}</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCommentLike(data.commentId, reply.replyId, reply.isCommentReplyLiked ? 0 : 1)}
                                                                        className="text-text-color"
                                                                        aria-label="Like Reply"
                                                                    >
                                                                        {reply.isCommentReplyLiked ? (
                                                                            <IoStarSharp className="text-4xl p-2 text-yellow-500" />
                                                                        ) : (
                                                                            <IoStarOutline className="text-4xl p-2 hover:text-yellow-500" />
                                                                        )}
                                                                    </button>
                                                                </div>

                                                                <p className="text-xs pl-12">{reply.reply}</p>

                                                                <div className="flex items-center text-xs pl-12 text-text-color mt-1">
                                                                    <span className="mr-3">{reply.commentDays}</span>
                                                                    {reply.commentReplyLikeCount > 0 && <span className="mr-3">{reply.commentReplyLikeCount} {reply.commentReplyLikeCount === 1 ? 'like' : 'likes'}</span>}
                                                                    <button onClick={() => handleReply(data.commentId, reply.userName)}>Reply</button>
                                                                    <button
                                                                        className="text-text-color relative ml-3"
                                                                        aria-label="More Options"
                                                                        onClick={() => setIsCommentsMenuOpen({ commentId: data.commentId, replyId: reply.replyId })}
                                                                    >
                                                                        •••

                                                                        {isCommentsMenuOpen?.commentId === data.commentId && isCommentsMenuOpen.replyId === reply.replyId && (
                                                                            <EllipsisMenu onClose={handleCloseCommentsMenu} data={data} isLoggedInPostOwner={flix.userId === userId} updateComments={updateComments} replyId={reply.replyId} isFlix={true} />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Load more / Hide replies buttons */}
                                                        <div className="flex gap-2 mt-1">
                                                            {data.replyData.length > (visibleRepliesCount[data.commentId] || REPLIES_PER_LOAD) && (
                                                                <button
                                                                    onClick={() => loadMoreReplies(data.commentId, data.replyData.length)}
                                                                    className="text-xs text-primary-text-color hover:underline flex items-center gap-1"
                                                                >
                                                                    <div className="w-5 h-px bg-primary-text-color"></div> Load {Math.min(REPLIES_PER_LOAD, data.replyData.length - (visibleRepliesCount[data.commentId] || 0))} more replies
                                                                </button>
                                                            )}
                                                            {/* <button 
                                                    onClick={() => toggleReplies(data.commentId, data.replyData.length)}
                                                    className="text-xs text-primary-text-color hover:underline flex items-center gap-1"
                                                    >
                                                    <div className="w-5 h-px bg-primary-text-color"></div> Hide replies
                                                    </button> */}
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                        )}
                                        {openReportModal?.commentId === data.commentId && <ReportModal postId={flix.postId} commentId={data.commentId} replyId={openReportModal?.replyId} onClose={() => { setOpenReportModal(null) }} isFlix={true} />}
                                    </div>
                                ))}
                                {commentsData.length === 0 && (
                                    <p className="text-sm text-text-color">No comments yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {isSharingVideo && (
                <SharePostModal data={flix} type={7} onClose={() => setIsSharingVideo(false)} postId={flix.postId} updatePost={shareFlix} />
            )}
        </>
    );
}

export default FlixVideoModal;