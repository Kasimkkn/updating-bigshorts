import React from 'react';
import CommentsSection from '../../CommentUi/CommentUi';
import PostActivity from './PostActivity';
import SharePostModal from '../../modal/SharePostModal';

interface PostExpandableContentProps {
    isExpanded: { type: 'like' | 'comment' | 'share', postId: number, isExpanded: boolean } | null;
    postId: number;
    onClose: () => void;
    postOwner: string;
    isLoggedInPostOwner: boolean;
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void;
    post: any;
    type?: number;
}

const PostExpandableContent: React.FC<PostExpandableContentProps> = ({
    isExpanded,
    postId,
    onClose,
    postOwner,
    isLoggedInPostOwner,
    updatePost,
    post,
    type = 4
}) => {
    if (!isExpanded || isExpanded.postId !== postId) return null;

    return (
        <div
            className={`xl:bg-bg-color rounded-md xl:ml-5 
        absolute bottom-0 left-0 w-full md:p-4 xl:h-full h-96
        transition-all duration-300 ease-in-out shadow-md
        ${isExpanded.isExpanded ? "xl:translate-x-full xl:opacity-100" : "xl:translate-x-0 xl:opacity-0"}
      `}
        >
            {isExpanded.type === 'comment' && (
                <CommentsSection
                    closeModal={onClose}
                    width="w-full"
                    height="h-full"
                    commentsHeight="h-[calc(100%-6rem)]"
                    postId={postId}
                    postOwner={postOwner}
                    isLoggedInPostOwner={isLoggedInPostOwner}
                    updatePost={updatePost}
                />
            )}

            {isExpanded.type === 'like' && (
                <PostActivity
                    postId={postId}
                    closeModal={onClose}
                />
            )}

            {isExpanded.type === 'share' && (
                <SharePostModal
                    data={post}
                    onClose={onClose}
                    postId={postId}
                    updatePost={updatePost}
                    isModal={false}
                    type={type}
                />
            )}
        </div>
    );
};

export default PostExpandableContent