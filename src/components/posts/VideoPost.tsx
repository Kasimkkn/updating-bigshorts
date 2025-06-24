"use client";
import { VideoSaved } from '@/types/savedTypes';
import { getTimeDifference } from '@/utils/features';
import useUserRedirection from '@/utils/userRedirection';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import Avatar from '../Avatar/Avatar';
import CommentsSection from '../CommentUi/CommentUi';
import PostActivity from '../PostActivity/PostActivity';
import PostTitle from '../PostTitle';
import SharePostModal from '../modal/SharePostModal';
import LikeCommentShare from './LikeCommentShare';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../shared/SafeImage';

interface VideoPostProps {
    post: VideoSaved;
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void
    onExpandChange?: (isExpanded: boolean) => void;
}

const VideoPost = ({ post, updatePost, onExpandChange }: VideoPostProps) => {
    const { setSnipId, } = useInAppRedirection()
    const router = useRouter();
    const redirectUser = useUserRedirection();
    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;
    const [isPostExpanded, setIsPostExpanded] = useState<{ type: 'like' | 'comment' | 'share', postId: number, isExpanded: boolean } | null>(null); //open comment section
    const [videoLoading, setVideoLoading] = useState(false);

    useEffect(() => {
        if (!isPostExpanded) return;

        const handleClickOutside = (e: MouseEvent) => {
            const targetElement = e.target as HTMLElement;
            const isInsideExpandedContainer = targetElement.closest('.expanded-container');

            if (!isInsideExpandedContainer) {
                setIsPostExpanded(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isPostExpanded]);

    useEffect(() => {
        onExpandChange?.(isPostExpanded !== null);
    }, [isPostExpanded, onExpandChange]);

    // useEffect(() => {
    //     if (!isPostExpanded) return;

    //     let lastScrollY = window.scrollY;

    //     const handleScroll = () => {
    //         const currentScrollY = window.scrollY;
    //         const scrollDiff = Math.abs(currentScrollY - lastScrollY);

    //         if (scrollDiff < 5) return; // Ignore small scroll changes
    //         setIsPostExpanded(null);
    //     };

    //     window.addEventListener('scroll', handleScroll, { passive: true });
    //     return () => {
    //         window.removeEventListener('scroll', handleScroll);
    //     };
    // }, [isPostExpanded]);

    const collapsePost = () => {
        setIsPostExpanded(null);
    }

    const newVideoUrl = post.videoFile[0].replace(
        'https://d1332u4stxguh3.cloudfront.net/',
        '/video/'
    );

    const handleRedirect = async (type: string, postId: number) => {
        if (type == "snips") {
            setSnipId(postId);
            router.push('/home/snips')
        }
    }

    return (
        <div className={`
            relative transition-all duration-300 ease-in-out
            ${isPostExpanded?.postId === post.postId ? 'xl:w-[200%] xl:-translate-x-1/4' : ''}
        `}>
            {post.videoFile && (
                <div
                    className={`max-w-lg max-h-[90vh] p-4 rounded-lg flex flex-col gap-1 relative
                        transition-transform duration-300 ease-in-out bg-bg-color expanded-container shadow-md
                        ${isPostExpanded?.postId === post.postId ? 'xl:w-1/2' : 'xl:translate-x-0'}
                    `}
                    style={{ zIndex: isPostExpanded?.postId === post.postId ? 50 : 'auto' }}
                >
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => {
                                redirectUser(post.userId, `/home/users/${post.userId}`)
                            }}
                            className='flex items-center'>
                            <Avatar src={post.userProfileImage} name={post.userFullName || post.userName} />
                            <div className="ml-2 flex flex-col">
                                <p className="font-bold text-text-color">
                                    {post.userName}
                                    {post.firstCollaboratorName && <span className='font-light'> with {post.firstCollaboratorName} {post.collaboratorCount - 1 > 0 && ` and ${post.collaboratorCount - 1} others`}</span>}
                                </p>
                                <p className="text-start text-sm text-text-color">{post.postLocation ? post.postLocation[0] ? post.postLocation[0].locationName : '\u00A0' : '\u00A0'}</p>
                            </div>
                        </button>
                    </div>
                    {post.postTitle && <div className='flex items-center text-primary-text-color'>
                        <PostTitle description={post.postTitle} taggedUsers={post.postTagUser} />
                    </div>}
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

                    <div
                        className={`
                            xl:bg-bg-color rounded-md xl:ml-5 
                            absolute bottom-0 left-0 w-full md:p-4 xl:h-full h-96
                            transition-all duration-300 ease-in-out shadow-md max-w-lg
                            ${isPostExpanded?.postId !== post.postId && 'hidden'}
                            ${isPostExpanded?.isExpanded ? "xl:translate-x-full xl:opacity-100" : "xl:translate-x-0 xl:opacity-0"}
                        `}
                    >
                        {isPostExpanded?.type === 'comment' &&
                            <CommentsSection
                                closeModal={collapsePost}
                                width="w-full"
                                height="h-full"
                                commentsHeight='h-[calc(100%-6rem)]'
                                postId={post.postId}
                                postOwner={post.userFullName ? post.userFullName : post.userName}
                                isLoggedInPostOwner={post.userId === userId}
                                updatePost={updatePost}
                            />}

                        {isPostExpanded?.type === 'like' &&
                            <PostActivity
                                postId={post.postId}
                                closeModal={() => { collapsePost() }}
                            />}

                        {isPostExpanded?.type === 'share' &&
                            <SharePostModal
                                data={post}
                                onClose={() => { collapsePost() }}
                                postId={post.postId}
                                updatePost={updatePost}
                                isModal={false}
                                type={4}
                            />}

                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPost;
