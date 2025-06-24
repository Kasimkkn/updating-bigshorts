import { PostlistItem } from '@/models/postlistResponse';
import { saveFlixLike } from '@/services/saveflixlike';
import { savePostLike } from '@/services/savepostlike';
import { ImageSaved } from '@/types/savedTypes';
import React from 'react'
import { saveOtherPost } from '@/services/saveotherpost';
import { saveOtherFlix } from '@/services/saveotherflix';
import toast from 'react-hot-toast';
import { MdBookmark, MdBookmarkBorder, MdOutlineBookmark, MdOutlineBookmarkBorder, MdOutlineComment, MdOutlineMessage, MdStar, MdStarOutline } from 'react-icons/md';
import { PiPaperPlaneTilt } from 'react-icons/pi';
import LikeButton from '../shared/LikeButton';

interface LikeCommentShareProps {
    post: PostlistItem | ImageSaved;
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void
    isPost: boolean;
    setIsPostExpanded: React.Dispatch<React.SetStateAction<{
        type: "like" | "comment" | "share";
        postId: number;
        isExpanded: boolean;
    } | null>>
}

const LikeCommentShare = ({ post, updatePost, isPost, setIsPostExpanded }: LikeCommentShareProps) => {

    const handleLike = async (postId: number) => {
        try {
            if (!postId) return;
            if (post?.isLiked || post?.isSuperLiked) {
                const res = isPost ? await savePostLike({ postId, isLike: 0 }) : await saveFlixLike({ postId, isLike: 0 }) //isLike = 0 in req body to dislike
                if (res.isSuccess) {
                    updatePost(post.postId, 'like', 1) //postId, peoperty, property value before update
                }
            } else {
                const res = isPost ? await savePostLike({ postId, isLike: 1 }) : await saveFlixLike({ postId, isLike: 1 })
                if (res.isSuccess) {
                    updatePost(post.postId, 'like', 0)
                }
            }

        } catch (error) {
            console.error('Error liking the video:', error);
        }
    }

    const handleSave = async (postId: number, isSave: number) => {
        try {
            if (!postId) return;
            const res = isPost ? await saveOtherPost({ postId: postId.toString(), isSave }) : await saveOtherFlix({ postId, isSave })
            if (res.isSuccess) {
                updatePost(post.postId, 'save', post.isSaved)
            }

        } catch (error) {
            console.error('Error liking the video:', error);
        }
    }

    const openComments = (postId: number) => {
        setIsPostExpanded({ type: "comment", postId, isExpanded: true });
    }

    const openPostActivity = (postId: number, post: PostlistItem | ImageSaved) => {
        if (post.likeCount > 0) {
            setIsPostExpanded({ type: "like", postId, isExpanded: true });
        } else {
            toast.error("No likes to display");
        }
    }

    const openShareModal = (postId: number) => {
        setIsPostExpanded({ type: "share", postId, isExpanded: true });
    }

    return (
        <div className="flex items-center justify-between mt-2">
            <div className='flex items-center gap-5'>
                <div className='flex gap-3 items-center hover:cursor-pointer'>

                    {post.isLiked || post.isSuperLiked ? (
                        <MdStar
                            key="liked"
                            onClick={() => handleLike(post.postId)}
                            className="text-text-color text-yellow-500 mb-[2px] animate-bounce-star"
                            size={25}
                        />
                    ) : (
                        <MdStarOutline
                            key="unliked"
                            onClick={() => handleLike(post.postId)}
                            className="text-text-color hover:text-yellow-500 mb-[2px]"
                            size={25}
                        />
                    )}

                    <span
                        onClick={() => { openPostActivity(post.postId, post) }}
                        className="flex gap-5 text-text-color">{post.likeCount}</span>
                </div>
                {post.isAllowComment === 1 && (
                    <div className='flex gap-3 items-center hover:cursor-pointer' onClick={() => openComments(post.postId)}>
                        <MdOutlineComment className='text-text-color' size={23} />
                        <span className="flex gap-1 text-text-color">{post.commentCount}</span>
                    </div>
                )}
                <div className='flex gap-2 items-center hover:cursor-pointer' onClick={() => openShareModal(post.postId)}>
                    <PiPaperPlaneTilt className='text-text-color pb-1' size={25} /> Send
                </div>
            </div>
            <div className='flex gap-2 items-center hover:cursor-pointer' onClick={() => handleSave(post.postId, post.isSaved)}>
                {post.isSaved == 0 ? <MdBookmarkBorder className='text-text-color' size={25} /> : <MdBookmark className='text-text-color' size={25} />}
                <button className="flex gap-1 text-text-color">
                </button>
            </div>
        </div>
    )
}

export default LikeCommentShare