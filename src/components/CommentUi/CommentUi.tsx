import EllipsisMenu from '@/components/CommentUi/EllipsisMenu';
import { flixCommentList } from '@/services/flixcommentlist';
import { postCommentList, PostCommentListResponse } from '@/services/postcommentlist';
import { saveCommentLike } from '@/services/savecommentlike';
import { saveFlixComment } from '@/services/saveflixcomment';
import { saveFlixLike } from '@/services/saveflixlike';
import { savePostComment } from '@/services/savepostcomment';
import { emojiList } from '@/types/storyTypes';
import useUserRedirection from '@/utils/userRedirection';
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaPlus } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import { IoStarOutline, IoStarSharp } from 'react-icons/io5';
import { TiPinOutline } from 'react-icons/ti';
import Avatar from '../Avatar/Avatar';
import CommonModalLayer from '../modal/CommonModalLayer';
import ReportModal from '../modal/ReportModal';
import Input from '../shared/Input';
import { CommentsSectionSkeleton } from '../Skeletons/Skeletons';

interface CommentUiProps {
    postId?: number;
    flixId?: number;
    postOwner?: string;
    closeModal?: () => void;
    width: string;
    height: string;
    commentsHeight?: string;
    isLoggedInPostOwner?: boolean;
    updatePost?: (postId: number, property: string, isBeforeUpdate: number) => void;
}

const CommentsSection: React.FC<CommentUiProps> = ({
    postId,
    flixId,
    postOwner,
    closeModal,
    width,
    height,
    commentsHeight = 'max-h-[270px]',
    isLoggedInPostOwner = false,
    updatePost
}) => {
    const [commentsData, setCommentsData] = useState<PostCommentListResponse[]>([]);
    const [commentReply, setCommentReply] = useState<string>('');
    const [replyingToCommentId, setReplyingToCommentId] = useState<number>(0); //zero for original comment
    const [replyingToUsername, setReplyingToUsername] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const redirectUser = useUserRedirection();
    const [loading, setLoading] = useState<boolean>(false);
    const [isCommentsMenuOpen, setIsCommentsMenuOpen] = useState<{ commentId: number, replyId: number } | null>(null);
    const [showHalfEmoji, setShowHalfEmoji] = useState(false);
    const [showFullEmoji, setShowFullEmoji] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [openReportModal, setOpenReportModal] = useState<{ commentId: number, replyId: number } | null>(null);
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
    const [visibleRepliesCount, setVisibleRepliesCount] = useState<Record<number, number>>({});
    const [isMobileView, setIsMobileView] = useState<boolean>(false);

    const REPLIES_PER_LOAD = 10;

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 786);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobileView) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileView]);
    const getCommentsData = async () => {
        try {
            setLoading(true);
            let response;
            if (flixId) {
                response = await flixCommentList({ postId: flixId });
            } else if (postId) {
                response = await postCommentList({ postId });
            }
            if (response?.isSuccess) {
                setCommentsData(response.data);
            } 
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCommentsData();
    }, [postId]);

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

    const sendComments = async () => {
        try {
            let response;
            if (flixId) {
                response = await saveFlixComment({
                    postId: flixId,
                    comment: commentReply,
                    commentId: replyingToCommentId,
                });
            } else if (postId) {
                response = await savePostComment({
                    postId: postId,
                    comment: commentReply,
                    commentId: replyingToCommentId,
                });
            }

            if (response?.isSuccess) {
                setCommentReply('');
                setReplyingToCommentId(0);
                setReplyingToUsername('');
                getCommentsData();
                updatePost && updatePost(flixId || postId!, 'comment', 1);
            } 
        } catch (error) {
            console.error('Error sending comment:', error);
        }
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
            updatePost && updatePost(flixId || postId!, 'comment', -1);
        }
        else if (property === 'pin') {
            getCommentsData();
        }
        else if (property === 'report') {
            setOpenReportModal({ commentId, replyId });
        }

    }

    const handleCommentLike = async (commentId: number, replyId: number, isLike: number) => {
        try {
            let response;
            if (flixId) {
                response = await saveFlixLike({
                    postId: flixId,
                    isLike: isLike
                });
            } else if (postId) {
                response = await saveCommentLike({
                    postId: postId,
                    commentId: commentId,
                    replyId: replyId,
                    isLike: isLike
                });
            }
            if (response?.isSuccess) {
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
    const handleOpenEmojiModal = () => {
        setShowHalfEmoji(true);
    };

    const handleCloseHalfEmoji = () => {
        setShowHalfEmoji(false);
    };

    const handleOpenFullEmojiUi = () => {
        setShowFullEmoji(true);
        handleCloseHalfEmoji();
    };

    const handleCloseFullEmoji = () => {
        setShowFullEmoji(false);
    };

    const handleCloseCommentsMenu = () => {
        setIsCommentsMenuOpen(null)
    }

    const insertEmoji = (emoji: string) => {
        const start = commentReply.substring(0, cursorPosition);
        const end = commentReply.substring(cursorPosition);
        const newText = start + emoji + end;
        setCommentReply(newText);
    };

    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
        const input = e.target as HTMLInputElement;
        setCursorPosition(input.selectionStart || 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommentReply(e.target.value);
        setCursorPosition(e.target.selectionStart || 0);
    };

    const HalfEmojiUi = () => (
        <div className="absolute bottom-14 left-0 flex items-center space-x-2 p-2 rounded-lg bg-bg-color bg-opacity-50">
            {emojiList.slice(0, 5).map((emoji, index) => (
                <span
                    onClick={() => {
                        insertEmoji(emoji);
                        handleCloseHalfEmoji();
                    }}
                    key={index}
                    className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                >
                    {emoji}
                </span>
            ))}
            <button
                onClick={handleOpenFullEmojiUi}
                className="text-2xl text-text-color hover:scale-110 transition-transform"
            >
                <FaPlus />
            </button>
        </div>
    );

    return (
        <div className={`relative flex flex-col ${width} ${height} bg-bg-color text-text-color ${width === 'w-full' ? 'px-4 py-3' : 'p-3'} rounded-lg z-50`}>

            {closeModal && (
                <div className="flex gap-5 mb-4 items-center">
                    <FaChevronLeft size={20} onClick={closeModal} />
                    <span className="font-bold">{commentsData.length} {commentsData.length === 1 ? 'Comment' : 'Comments'}</span>
                </div>
            )}
            <div className={`flex flex-col ${commentsHeight} overflow-y-auto`}>
                {loading ? (
                    <CommentsSectionSkeleton />
                ) : (

                    <>
                        {commentsData.length > 0 ? (
                            commentsData.map((data, index) => (
                                <div key={index} className="flex flex-col p-2 rounded-lg mb-2 relative">

                                    {/* Pinned comment indicator */}
                                    {data.is_pin === 1 && (
                                        <div className="flex w-full pl-10 pb-1">
                                            <TiPinOutline />
                                            <span className="text-xs"> Pinned by {postOwner}</span>
                                        </div>
                                    )}

                                    {/* Avatar and Like button */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => {
                                                redirectUser(data.userId, `/home/users/${data.userId}`)
                                            }}
                                            className="flex items-center gap-2">
                                            <Avatar name={data.userName} src={data.userProfileImage} />
                                            <span className="font-bold text-sm">{data.userName}</span>
                                        </button>
                                        <button
                                            onClick={() => handleCommentLike(data.commentId, 0, data.isCommentLiked ? 0 : 1)}
                                            className="text-text-color"
                                            aria-label="Like Comment"
                                        >
                                            {data.isCommentLiked ? (
                                                <IoStarSharp size={20} className='text-yellow-500 text-text-color' />
                                            ) : (
                                                <IoStarOutline size={20} className='hover:text-yellow-500' />
                                            )}
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <p className="text-sm pl-11">{data.comment}</p>

                                    {/* Reply and more options button */}
                                    <div className="flex items-center text-xs pl-11 text-text-color mt-2">
                                        <span className="mr-3">{data.commentDays}</span>
                                        {data.commentLikeCount > 0 && <span className="mr-3">{data.commentLikeCount} {data.commentLikeCount === 1 ? 'like' : 'likes'}</span>}
                                        <button className="mr-3" onClick={() => handleReply(data.commentId, data.userName)}>Reply</button>
                                        <button
                                            className="text-text-color relative"
                                            aria-label="More Options"
                                            onClick={() => setIsCommentsMenuOpen({ commentId: data.commentId, replyId: 0 })}
                                        >
                                            •••

                                            {isCommentsMenuOpen?.commentId === data.commentId && isCommentsMenuOpen?.replyId === 0 && (
                                                <EllipsisMenu onClose={handleCloseCommentsMenu} data={data} isLoggedInPostOwner={isLoggedInPostOwner} updateComments={updateComments} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Replies section */}
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
                                                                        <IoStarSharp size={16} className='text-yellow-500 text-text-color' />
                                                                    ) : (
                                                                        <IoStarOutline size={16} className='hover:text-yellow-500' />
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
                                                                        <EllipsisMenu onClose={handleCloseCommentsMenu} data={data} isLoggedInPostOwner={isLoggedInPostOwner} updateComments={updateComments} replyId={reply.replyId} />
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

                                    {openReportModal?.commentId === data.commentId && <ReportModal postId={flixId || postId!} commentId={data.commentId} replyId={openReportModal.replyId} onClose={() => { setOpenReportModal(null) }} />}
                                </div>
                            ))
                        ) : (
                            <p className="text-lg text-center">No Comments Yet</p>
                        )}
                    </>
                )}
            </div>

            {/* Reply indicator */}
            {replyingToCommentId !== 0 && (
                <div className="absolute bottom-14 left-3 right-3 flex items-center justify-between px-3 py-2 bg-primary-bg-color rounded-t-lg border-b border-gray-700">
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

            {showHalfEmoji && <HalfEmojiUi />}
            {showFullEmoji && <FullEmojiUi handleCloseFullEmoji={handleCloseFullEmoji} insertEmoji={insertEmoji} />}

            <div className="absolute bottom-0 right-3 left-3 flex items-center justify-between bg-primary-bg-color p-2 rounded-b-lg">
                <span
                    className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                    onClick={handleOpenEmojiModal}
                >
                    <FaPlus />
                </span>
                <Input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 ml-2 rounded-lg focus:outline-none bg-primary-bg-color"
                    value={commentReply}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    ref={inputRef}
                />
                <span
                    className="ml-2 cursor-pointer hover:scale-110 transition-transform"
                    onClick={sendComments}
                    aria-label="Send Comment"
                >
                    <IoMdSend size={27} />
                </span>
            </div>
        </div>
    );
};

const FullEmojiUi = ({ handleCloseFullEmoji, insertEmoji }: { handleCloseFullEmoji: () => void; insertEmoji: (emoji: string) => void; }) => (
    <CommonModalLayer width='w-max' height='h-max'>
        <div className="bg-bg-color rounded-lg w-80 h-72 p-4 overflow-hidden absolute">
            <button
                className="absolute rotate-45 top-2 right-2 text-xl text-text-color hover:scale-110 transition-transform"
                onClick={handleCloseFullEmoji}
            >
                <FaPlus />
            </button>
            <div className="grid grid-cols-6 gap-2 p-2 overflow-auto max-h-[90%]">
                {emojiList.map((emoji, index) => (
                    <span
                        onClick={() => {
                            insertEmoji(emoji);
                            handleCloseFullEmoji();
                        }}
                        key={index}
                        className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                    >
                        {emoji}
                    </span>
                ))}
            </div>
        </div>
    </CommonModalLayer>
);

export default CommentsSection;