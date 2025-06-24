import React from 'react';
import { ImageSaved } from '@/types/savedTypes';
import useUserRedirection from '@/utils/userRedirection';
import PostTitle from '../PostTitle';
import ImageSlider from './ImageSlider';
import LikeCommentShare from './LikeCommentShare';
import useLocalStorage from '@/hooks/useLocalStorage';
import { IoClose } from 'react-icons/io5';

// Import shared components
import PostContainer from './shared/PostContainer';
import PostHeader from './shared/PostHeader';
import PostExpandableContent from './shared/PostExpandableContent';
import { usePostExpansion } from './shared/usePostExpansion';

interface ImagePostProps {
    post: ImageSaved;
    containerWidth?: string;
    imageheight?: string;
    imageWidth?: string;
    handleOpenImage?: (postDetails: any) => void;
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void;
    onExpandChange?: (isExpanded: boolean) => void;
}

const ImagePost: React.FC<ImagePostProps> = ({
    post,
    containerWidth,
    imageheight,
    imageWidth,
    handleOpenImage,
    updatePost,
    onExpandChange
}) => {
    const redirectUser = useUserRedirection();
    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;
    const { isPostExpanded, setIsPostExpanded, collapsePost } = usePostExpansion();

    if (!post.coverFile) return null;

    return (
        <PostContainer
            postId={post.postId}
            isExpanded={isPostExpanded?.postId === post.postId}
            onExpandedChange={onExpandChange}
            className={`${containerWidth || 'max-w-[25rem]'} md:p-4 rounded-lg flex flex-col gap-1 relative
        transition-transform duration-300 ease-in-out bg-bg-color expanded-container shadow-md`}
        >
            <PostHeader
                post={post}
                userId={userId}
                openMoreOptions={null}
                setOpenMoreOptions={() => { }}
                onUserClick={(userId) => redirectUser(userId, `/home/users/${userId}`)}
                showFollowButton={false}
                showCloseButton={!!handleOpenImage}
                onClose={handleOpenImage ? () => handleOpenImage(post) : undefined}
            />

            {post.postTitle && (
                <div className="flex items-center text-text-color">
                    <PostTitle description={post.postTitle} taggedUsers={post.postTagUser} />
                </div>
            )}

            <ImageSlider images={post.interactiveVideo} />

            <LikeCommentShare
                post={post}
                updatePost={updatePost}
                isPost={true}
                setIsPostExpanded={setIsPostExpanded}
            />

            <PostExpandableContent
                isExpanded={isPostExpanded}
                postId={post.postId}
                onClose={collapsePost}
                postOwner={post.userFullName || post.userName}
                isLoggedInPostOwner={post.userId === userId}
                updatePost={updatePost}
                post={post}
                type={4}
            />
        </PostContainer>
    );
};

export default ImagePost;