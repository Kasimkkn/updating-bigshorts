"use client";
import { ImageSaved } from '@/types/savedTypes';
import useUserRedirection from '@/utils/userRedirection';
import { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import Avatar from '../Avatar/Avatar';
import CommentsSection from '../CommentUi/CommentUi';
import PostActivity from '@/components/PostActivity/PostActivity';
import SharePostModal from '../modal/SharePostModal';
import PostTitle from './../PostTitle';
import ImageSlider from './ImageSlider';
import LikeCommentShare from './LikeCommentShare';
import useLocalStorage from '@/hooks/useLocalStorage';

interface ImagePostProps {
    post: ImageSaved;
    containerWidth?: string;
    imageheight?: string;
    imageWidth?: string;
    handleOpenImage?: (postDetails: any) => void;
    updatePost: (postId: number, property: string, isBeforeUpdate: number) => void;
    onExpandChange?: (isExpanded: boolean) => void;
}

const ImagePost = ({ post, containerWidth, imageheight, imageWidth, handleOpenImage, updatePost, onExpandChange }: ImagePostProps) => {

    const redirectUser = useUserRedirection();
    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;
    const [isPostExpanded, setIsPostExpanded] = useState<{ type: 'like' | 'comment' | 'share', postId: number, isExpanded: boolean } | null>(null); //open comment section

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

    useEffect(() => {
        onExpandChange?.(isPostExpanded !== null);
    }, [isPostExpanded, onExpandChange]);

    const collapsePost = () => {
        setIsPostExpanded(null);
    }

    return (
        <div className={`
            relative transition-all duration-300 ease-in-out
            ${isPostExpanded?.postId === post.postId ? 'xl:w-[200%] xl:-translate-x-1/4' : ''}
        `}>

            {post.coverFile && (
                <div
                    className={`${containerWidth || 'max-w-[25rem]'} md:p-4 rounded-lg flex flex-col gap-1 relative
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
                            {handleOpenImage && (
                                <div
                                    className='absolute right-2 top-2'
                                    onClick={() => handleOpenImage(post)}>
                                    <IoClose className="text-text-color text-2xl cursor-pointer" />
                                </div>
                            )}
                        </button>
                    </div>
                    {post.postTitle && <div className='flex items-center text-text-color'>
                        <PostTitle description={post.postTitle} taggedUsers={post.postTagUser} />
                    </div>}
                    <ImageSlider images={post.interactiveVideo} />
                    <LikeCommentShare
                        post={post}
                        updatePost={updatePost}
                        isPost={true}
                        setIsPostExpanded={setIsPostExpanded}
                    />

                    {/* container for comments, likes and share */}
                    <div
                        className={`xl:bg-bg-color rounded-md xl:ml-5 
                            absolute bottom-0 left-0 w-full md:p-4 xl:h-full h-96
                            transition-all duration-300 ease-in-out  shadow-md
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

export default ImagePost;
