'use client';
import VideoPlayerWidget from '@/components/VideoAndImagesComp/VideoPlayerWidget';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { PostlistItem } from '@/models/postlistResponse';
import { fetchInsights } from '@/services/fetchinsights';
import { fetchInsightsPosts } from '@/services/fetchinsightsposts';
import { savePostLike } from '@/services/savepostlike';
import { timeAgo } from '@/utils/features';
import useUserRedirection from '@/utils/userRedirection';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import ContentTree from '../Interactive/contentTree';
import PostTitle from '../PostTitle';
import LikeCommentShare from './LikeCommentShare';

// Import shared components
import PostActions from './shared/PostActions';
import PostContainer from './shared/PostContainer';
import PostExpandableContent from './shared/PostExpandableContent';
import PostHeader from './shared/PostHeader';
import PostImageWithActions from './shared/PostImageWithActions';
import PostModals from './shared/PostModals';
import { transformAudioUrl, transformVideoUrl } from './shared/urlUtils';
import { useAudioPlayback } from './shared/useAudioPlayback';
import { useInfiniteScroll } from './shared/useInfiniteScroll';
import { usePostData } from './shared/usePostData';
import { usePostExpansion } from './shared/usePostExpansion';
import { usePostModals } from './shared/usePostModals';
import { useVideoPlayback } from './shared/useVideoPlayback';

interface PostsProps {
    postData: PostlistItem[];
    loadMorePosts: () => void;
    index?: number;
    isFromSaved: boolean;
    isFromProfile: boolean;
}

const Posts: React.FC<PostsProps> = ({
    postData,
    loadMorePosts,
    index,
    isFromSaved,
    isFromProfile
}) => {
    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;
    const { setInAppSnipsData, setSnipIndex, profilePostId, setSnipId } = useInAppRedirection();
    const router = useRouter();
    const redirectUser = useUserRedirection();

    // Use shared hooks
    const { postItem, updatePost } = usePostData(postData);
    const { isPostExpanded, setIsPostExpanded, collapsePost } = usePostExpansion();
    const {
        videoMuteStates,
        videoPlaybackStatus,
        activeVideoIndex,
        videoDivRefs,
        handleMuteToggle
    } = useVideoPlayback(postItem);

    const { audioMuteStates, handleAudioMuteToggle } = useAudioPlayback(postItem);

    const {
        openMoreOptions,
        setOpenMoreOptions,
        isReportModalOpen,
        isAboutAccountModalOpen,
        isModalOpen,
        setIsModalOpen,
        isPostsModalOpen,
        setIsPostsModalOpen,
        postInsightsModalCoverfile,
        setPostInsightsModalCoverfile,
        insightsData,
        setInsightsData,
        postInsightsData,
        setPostInsightsData,
        isPostUsersModalOpen,
        setIsPostUsersModalOpen,
        contentTreeOpen,
        setContentTreeOpen,
        openReportModal,
        openAboutAccountModal
    } = usePostModals();

    useInfiniteScroll(loadMorePosts);

    const [snipClickTimer, setSnipClickTimer] = useState<NodeJS.Timeout | null>(null);

    const handleLike = async (postId: number, isLiked: number) => {
        try {
            if (!postId || isLiked) return;
            const res = await savePostLike({ postId, isLike: 1 });
            if (res.isSuccess) {
                updatePost(postId, 'like', 0);
            }
        } catch (error) {
            console.error('Error liking the post:', error);
        }
    };

    const handleRedirect = (type: string, data: any, index: number) => {
        if (type === "snips") {
            if (Array.isArray(data)) {
                const snips = data.filter((item: PostlistItem) => item.isForInteractiveVideo === 1);
                const totalNumberOFImagePost = data.slice(0, index).filter((item: PostlistItem) => item.isForInteractiveImage === 1).length;
                setInAppSnipsData(snips);
                setSnipIndex(index - totalNumberOFImagePost);
            } else {
                setSnipId(data.postId);
            }
            router.push('/home/snips');
        }
    };

    const fetchInsightsHandler = async (post: PostlistItem) => {
        try {
            const interactiveJson = JSON.parse(post.interactiveVideo.toString());
            setIsModalOpen(true);
            const response = await fetchInsights({
                postId: post.postId,
                videoId: interactiveJson[0]?.video_id ?? 0
            });
            if (response.isSuccess) {
                setInsightsData(response.data);
                setPostInsightsModalCoverfile({ image: post?.coverFile ?? '', aspect: 0.75 });
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
        }
    };

    const fetchInsightsPostsHandler = async (postId: number, post: PostlistItem) => {
        try {
            const interactiveVideo = post.interactiveVideo ? JSON.parse(post.interactiveVideo.toString()) : null;
            const aspect = interactiveVideo ? interactiveVideo[0]?.aspect_ratio : 0.75;
            setIsPostsModalOpen(true);
            const response = await fetchInsightsPosts(postId);
            if (response.isSuccess) {
                setPostInsightsData(response.data);
                setPostInsightsModalCoverfile({ image: post?.coverFile ?? '', aspect });
            }
        } catch (error) {
            console.error('Error fetching post insights:', error);
        }
    };

    const fetchVideoInsights = async (postId: number, videoId: number) => {
        console.log("NO MORE INSIGHTS");
    };

    return (
        <div className="space-y-4 w-full flex flex-col items-center relative">
            <div
                className={`fixed inset-0 bg-bg-color/10 backdrop-blur-sm transition-all duration-300 hidden xl:block
          ${isPostExpanded ? 'xl:opacity-100 xl:visible' : 'xl:opacity-0 xl:invisible'}`}
                style={{ zIndex: 40 }}
            />

            {postItem.map((post: PostlistItem, index: number) => {
                const newVideoUrl = transformVideoUrl(post?.videoFile?.[0] || '');
                const newAudioUrl = transformAudioUrl(post?.audioFile || '');
                const isThisVideoPlaying = videoPlaybackStatus[post.postId] ?? true;

                return (
                    <PostContainer
                        key={`${post.postId}-${index + 1}`}
                        postId={post.postId}
                        isExpanded={isPostExpanded?.postId === post.postId}
                        className="md:p-4 rounded-lg relative max-w-[25rem] transition-transform duration-300 ease-in-out bg-bg-color expanded-container w-full"
                    >
                        {/* Image Posts */}
                        {post.isForInteractiveImage === 1 && (
                            <>
                                <PostHeader
                                    post={post}
                                    userId={userId}
                                    openMoreOptions={openMoreOptions}
                                    setOpenMoreOptions={setOpenMoreOptions}
                                    onUserClick={(userId) => redirectUser(userId, `/home/users/${userId}`)}
                                    onCollaboratorsClick={() => setIsPostUsersModalOpen({
                                        postId: post.postId,
                                        isForCollaborators: true
                                    })}
                                    onReport={openReportModal}
                                    onAboutAccount={openAboutAccountModal}
                                    updatePost={updatePost}
                                />

                                <PostImageWithActions
                                    post={post}
                                    index={index}
                                    userId={userId}
                                    audioMuteStates={audioMuteStates}
                                    onAudioMuteToggle={handleAudioMuteToggle}
                                    onTaggedUsers={() => setIsPostUsersModalOpen({
                                        postId: post.postId,
                                        isForCollaborators: false
                                    })}
                                    onInsights={() => fetchInsightsPostsHandler(post.postId, post)}
                                    onDoubleClick={() => handleLike(post.postId, post.isLiked)}
                                    videoDivRef={videoDivRefs.current[index]}
                                />
                            </>
                        )}

                        {/* Interactive Video Posts */}
                        {post.isForInteractiveVideo === 1 && newVideoUrl && (
                            <div
                                className="relative flex justify-center items-center overflow-hidden dark-gray-600 rounded-lg"
                                ref={videoDivRefs.current[index]}
                                data-index={index}
                            >
                                <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center">
                                    <PostHeader
                                        post={post}
                                        userId={userId}
                                        openMoreOptions={openMoreOptions}
                                        setOpenMoreOptions={setOpenMoreOptions}
                                        onUserClick={(userId) => redirectUser(userId, `/home/users/${userId}`)}
                                        onCollaboratorsClick={() => setIsPostUsersModalOpen({
                                            postId: post.postId,
                                            isForCollaborators: true
                                        })}
                                        isInteractiveVideo={true}
                                        onReport={openReportModal}
                                        onAboutAccount={openAboutAccountModal}
                                        updatePost={updatePost}
                                        showFollowButton={userId !== post.userId}
                                    />

                                    <div className="flex items-center gap-2">
                                        {post.isInteractive === "1" && (
                                            <div
                                                className="bg-bg-color/40 backdrop-blur-sm rounded-xl px-2 py-1 flex items-center justify-center cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setContentTreeOpen({ postId: post.postId });
                                                }}
                                            >
                                                <span className="text-transparent bg-clip-text text-sm font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500">
                                                    {'{I}'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (snipClickTimer === null) {
                                            const timer = setTimeout(() => {
                                                handleRedirect('snips', postItem, index);
                                                setSnipClickTimer(null);
                                            }, 300);
                                            setSnipClickTimer(timer);
                                        } else {
                                            clearTimeout(snipClickTimer);
                                            setSnipClickTimer(null);
                                            handleLike(post.postId, post.isLiked);
                                        }
                                    }}
                                >
                                    <VideoPlayerWidget
                                        videoUrl={newVideoUrl}
                                        isMuted={videoMuteStates[post.postId] || !isThisVideoPlaying}
                                        handleMute={() => handleMuteToggle(post.postId)}
                                        isPlaying={activeVideoIndex === index}
                                        handleNext={() => { }}
                                        setCurrentTime={() => { }}
                                        jumpDuration={0}
                                        currentTime={0}
                                        allCurrentVideos={[]}
                                        currentVideoIndex={0}
                                        currentPost={post}
                                        updateCurrentIndex={() => { }}
                                        currentIndex={index}
                                        displayType={1}
                                        onHomeScreen={true}
                                        videoRef={React.createRef()}
                                        key={'posts-' + index}
                                        showInteractiveElements={false}
                                    />
                                </button>

                                <PostActions
                                    hasTaggedUsers={post.postTagUser.length > 0}
                                    onTaggedUsersClick={() => setIsPostUsersModalOpen({
                                        postId: post.postId,
                                        isForCollaborators: false
                                    })}
                                    showInsights={post.userId.toString() === userId.toString()}
                                    onInsightsClick={() => fetchInsightsHandler(post)}
                                    showAudioToggle={true}
                                    isMuted={videoMuteStates[post.postId]}
                                    onAudioToggle={() => handleMuteToggle(post.postId)}
                                />
                            </div>
                        )}

                        <div onClick={() => { }}>
                            <LikeCommentShare
                                post={post}
                                updatePost={updatePost}
                                isPost={true}
                                setIsPostExpanded={setIsPostExpanded}
                            />
                        </div>

                        {post.postTitle && (
                            <PostTitle
                                description={post.postTitle}
                                taggedUsers={post.postTagUser}
                                userName={post.userName}
                                userId={post.userId}
                            />
                        )}

                        <p className="font-thin text-sm mt-2">{timeAgo(post.scheduleTime)}</p>

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

                        {contentTreeOpen?.postId === post.postId && (
                            <ContentTree
                                postId={contentTreeOpen.postId}
                                onClose={() => setContentTreeOpen(null)}
                            />
                        )}
                    </PostContainer>
                );
            })}

            <PostModals
                isModalOpen={isModalOpen}
                insightsData={insightsData}
                postInsightsModalCoverfile={postInsightsModalCoverfile.image}
                onInsightsClose={() => {
                    setIsModalOpen(false);
                    setInsightsData(null);
                    setPostInsightsModalCoverfile({ image: '', aspect: 0.75 });
                }}
                isPostsModalOpen={isPostsModalOpen}
                postInsightsData={postInsightsData}
                aspect={postInsightsModalCoverfile.aspect}
                onPostInsightsClose={() => {
                    setIsPostsModalOpen(false);
                    setPostInsightsData(null);
                    setPostInsightsModalCoverfile({ image: '', aspect: 0.75 });
                }}
                fecthVideoPostInsights={fetchVideoInsights}
                isReportModalOpen={isReportModalOpen}
                onReportClose={() => openReportModal(0)}
                isAboutAccountModalOpen={isAboutAccountModalOpen}
                onAboutAccountClose={() => openAboutAccountModal(0)}
                isPostUsersModalOpen={isPostUsersModalOpen}
                taggedUsers={[]}
                onPostUsersClose={() => setIsPostUsersModalOpen(null)}
            />
        </div>
    );
};

export default Posts;