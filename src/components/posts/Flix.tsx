'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoPlayerWidget from '@/components/VideoAndImagesComp/VideoPlayerWidget';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { PostlistItem } from '@/models/postlistResponse';
import { fetchInsights } from '@/services/fetchinsights';
import { fetchInsightsPosts } from '@/services/fetchinsightsposts';
import { getPollByPosts } from '@/services/getpollbypost';
import useUserRedirection from '@/utils/userRedirection';
import PostTitle from '../PostTitle';
import LikeCommentShare from './LikeCommentShare';
import useLocalStorage from '@/hooks/useLocalStorage';

// Import shared components
import PostContainer from './shared/PostContainer';
import PostHeader from './shared/PostHeader';
import PostActions from './shared/PostActions';
import PostExpandableContent from './shared/PostExpandableContent';
import PostModals from './shared/PostModals';
import PostVideoWithActions from './shared/PostVideoWithActions';
import { usePostExpansion } from './shared/usePostExpansion';
import { useVideoPlayback } from './shared/useVideoPlayback';
import { usePostData } from './shared/usePostData';
import { useInfiniteScroll } from './shared/useInfiniteScroll';
import { usePostModals } from './shared/usePostModals';
import { transformVideoUrl } from './shared/urlUtils';
import ImageSlider from './ImageSlider';

interface FlixProps {
  postData: PostlistItem[];
  loadMorePosts: () => void;
  refreshPage: () => void;
}

const Flix: React.FC<FlixProps> = ({ postData, loadMorePosts, refreshPage }) => {
  const [id] = useLocalStorage<string>('userId', '');
  const userId = id ? parseInt(id) : 0;
  const { setInAppSnipsData, setSnipIndex, profilePostId } = useInAppRedirection();
  const router = useRouter();
  const redirectUser = useUserRedirection();

  // Use shared hooks
  const { postItem, updatePost } = usePostData(postData, refreshPage);
  const { isPostExpanded, setIsPostExpanded, collapsePost } = usePostExpansion();
  const {
    videoMuteStates,
    videoPlaybackStatus,
    activeVideoIndex,
    videoDivRefs,
    handleMuteToggle
  } = useVideoPlayback(postItem);

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
    openReportModal,
    openAboutAccountModal
  } = usePostModals();

  useInfiniteScroll(loadMorePosts);

  const sendTheViewCount = async (postId: number, userId: number, videoId: number) => {
    try {
      await getPollByPosts({ postId, videoId, userId });
    } catch (error) {
      console.error('Error Sending The View Count:', error);
    }
  };

  const handleRedirect = (type: string, data: any, index: number) => {
    if (type === "snips") {
      if (Array.isArray(data) && data.length === 0) {
        const snips = data.filter((item: PostlistItem) => item.isForInteractiveVideo === 1);
        const totalNumberOFImagePost = data.slice(0, index).filter((item: PostlistItem) => item.isForInteractiveImage === 1).length;
        setInAppSnipsData(snips);
        setSnipIndex(index - totalNumberOFImagePost);
      } else {
        const snipsData = [];
        snipsData.push(data);
        setInAppSnipsData(snipsData);
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
      setIsPostsModalOpen(true);
      const response = await fetchInsightsPosts(postId);
      if (response.isSuccess) {
        setPostInsightsData(response.data);
        setPostInsightsModalCoverfile({ image: post?.coverFile ?? '', aspect: 16 / 9 });
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
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
        const isThisVideoPlaying = videoPlaybackStatus[post.postId] ?? true;

        return (
          <PostContainer
            key={`${post.postId}-${index + 1}`}
            postId={post.postId}
            isExpanded={isPostExpanded?.postId === post.postId}
            className="md:p-4 rounded-lg relative max-w-lg transition-transform duration-300 ease-in-out bg-bg-color expanded-container"
          >
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
              iconVariant="horizontal"
            />

            {post.postTitle && <PostTitle description={post.postTitle} taggedUsers={post.postTagUser} />}

            {post.isForInteractiveImage === 1 && post.coverFile && (
              <div className="relative">
                <ImageSlider images={post.interactiveVideo} />
                <PostActions
                  hasTaggedUsers={post.postTagUser.length > 0}
                  onTaggedUsersClick={() => setIsPostUsersModalOpen({
                    postId: post.postId,
                    isForCollaborators: false
                  })}
                  showInsights={post.userId.toString() === userId.toString()}
                  onInsightsClick={() => fetchInsightsPostsHandler(post.postId, post)}
                />
              </div>
            )}

            {newVideoUrl && (
              <PostVideoWithActions
                post={post}
                index={index}
                userId={userId}
                newVideoUrl={newVideoUrl}
                isThisVideoPlaying={isThisVideoPlaying}
                activeVideoIndex={activeVideoIndex}
                videoMuteStates={videoMuteStates}
                onMuteToggle={handleMuteToggle}
                onTaggedUsers={() => setIsPostUsersModalOpen({
                  postId: post.postId,
                  isForCollaborators: false
                })}
                onInsights={() => fetchInsightsHandler(post)}
                onRedirect={() => handleRedirect('snips', post, index)}
                videoDivRef={videoDivRefs.current[index]}
                videoPlayerRef={React.createRef()}
              />
            )}

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
              type={7}
            />
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
        isReportModalOpen={isReportModalOpen}
        fecthVideoPostInsights={fetchVideoInsights}
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

export default Flix;