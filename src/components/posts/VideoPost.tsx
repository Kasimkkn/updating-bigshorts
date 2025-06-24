"use client";
import React, { useState } from 'react';
import { VideoSaved } from '@/types/savedTypes';
import useUserRedirection from '@/utils/userRedirection';
import ReactPlayer from 'react-player';
import PostTitle from '../PostTitle';
import LikeCommentShare from './LikeCommentShare';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../shared/SafeImage';

// Import shared components
import PostContainer from './shared/PostContainer';
import PostHeader from './shared/PostHeader';
import PostExpandableContent from './shared/PostExpandableContent';
import { usePostExpansion } from './shared/usePostExpansion';
import { transformVideoUrl } from './shared/urlUtils';

interface VideoPostProps {
    post: VideoSaved;
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void;
    onExpandChange?: (isExpanded: boolean) => void;
}

const VideoPost: React.FC<VideoPostProps> = ({
    post,
    updatePost,
    onExpandChange
}) => {
    const { setSnipId } = useInAppRedirection();
    const router = useRouter();
    const redirectUser = useUserRedirection();
    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;
    const { isPostExpanded, setIsPostExpanded, collapsePost } = usePostExpansion();
    const [videoLoading, setVideoLoading] = useState(false);

    const handleRedirect = async (type: string, postId: number) => {
        if (type === "snips") {
            setSnipId(postId);
            router.push('/home/snips');
        }
    };

    if (!post.videoFile) return null;

    const newVideoUrl = transformVideoUrl(post.videoFile[0]);

    return (
        <PostContainer
            postId={post.postId}
            isExpanded={isPostExpanded?.postId === post.postId}
            onExpandedChange={onExpandChange}
            className="max-w-lg max-h-[90vh] p-4 rounded-lg flex flex-col gap-1 relative
        transition-transform duration-300 ease-in-out bg-bg-color expanded-container shadow-md"
        >
            <PostHeader
                post={post}
                userId={userId}
                openMoreOptions={null}
                setOpenMoreOptions={() => { }}
                onUserClick={(userId) => redirectUser(userId, `/home/users/${userId}`)}
                showFollowButton={false}
            />

            {post.postTitle && (
                <div className="flex items-center text-primary-text-color">
                    <PostTitle description={post.postTitle} taggedUsers={post.postTagUser} />
                </div>
            )}

            <div
                className="w-full sm:w-[23rem] aspect-[9/16] video-container relative rounded-lg flex justify-center items-center overflow-hidden bg-bg-color"
                onClick={() => handleRedirect('snips', post.postId)}
            >
                {videoLoading && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                        <SafeImage
                            src={post.coverFile}
                            videoUrl={post?.videoFile[0]}
                            alt="Loading"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <ReactPlayer
                    url={newVideoUrl}
                    playing
                    loop
                    muted={true}
                    controls={false}
                    width="100%"
                    height="100%"
                    className="hover:cursor-pointer flex items-center justify-center bg-bg-color"
                    config={{
                        file: {
                            attributes: {
                                crossOrigin: 'anonymous',
                                preload: 'auto',
                                style: {
                                    width: '23rem',
                                    height: 'auto',
                                    objectFit: 'cover'
                                }
                            },
                            forceVideo: true,
                        }
                    }}
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

export default VideoPost;