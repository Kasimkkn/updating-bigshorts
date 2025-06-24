'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMoreHorizontal } from 'react-icons/fi';
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from 'react-icons/hi2';
import ReactPlayer from 'react-player';
import VideoPlayerWidget from '@/components/VideoAndImagesComp/VideoPlayerWidget';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { PostlistItem } from '@/models/postlistResponse';
import { VideoList } from '@/models/videolist';
import { ViewReactionsPostData } from '@/models/viewReactionsPostResponse';
import { ViewReactionsData } from '@/models/viewReactionsResponse';
import { fetchInsights } from '@/services/fetchinsights';
import { fetchInsightsPosts } from '@/services/fetchinsightsposts';
import { getPollByPosts } from '@/services/getpollbypost';
import useUserRedirection from '@/utils/userRedirection';
import Avatar from '../Avatar/Avatar';
import CommentsSection from '../CommentUi/CommentUi';
import FollowButton from '../FollowButton/FollowButton';
import InsightsModal from '../Insights/Insights';
import PostInsightsModal from '../Insights/PostInsights';
import MoreOptions from '../MoreOptions';
import PostActivity from '../PostActivity/PostActivity';
import PostTitle from '../PostTitle';
import ReportModal from '../modal/ReportModal';
import AboutAccountModal from '../modal/AboutAccountModal';
import SharePostModal from '../modal/SharePostModal';
import ImageSlider from './ImageSlider';
import LikeCommentShare from './LikeCommentShare';
import { BiUserPin } from 'react-icons/bi';
import useLocalStorage from '@/hooks/useLocalStorage';


const Flix = ({ postData, loadMorePosts, refreshPage }: { postData: PostlistItem[], loadMorePosts: () => void, refreshPage: () => void }) => {
  const [id] = useLocalStorage<string>('userId', '');
  const userId = id ? parseInt(id) : 0;
  const { setInAppSnipsData, setSnipIndex, profilePostId } = useInAppRedirection();
  const router = useRouter();
  const redirectUser = useUserRedirection();
  const [videoMuteStates, setVideoMuteStates] = useState<{ [key: number]: boolean }>({});
  const [postItem, setPostItem] = useState<PostlistItem[]>([]);

  useEffect(() => {
    if (postData && postData.length > 0) {
      setPostItem(postData);
    }
  }, [postData]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [allCurrentVideos, setAllCurrentVideos] = useState<VideoList[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<number | null>(null);
  const [isAboutAccountModalOpen, setIsAboutAccountModalOpen] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostsModalOpen, setisPostsModalOpen] = useState(false);
  const [postInsightsModalCoverfile, setPostInsightsModalCoverfile] = useState<string>('');
  const [insightsData, setInsightsData] = useState<ViewReactionsData | null>(null);
  const [postInsightsData, setPostInsightsData] = useState<ViewReactionsPostData | null>(null);
  const [isTaggedUsersOpen, setIsTaggedUsersOpen] = useState<number | null>(null);
  const [isPostExpanded, setIsPostExpanded] = useState<{ type: 'like' | 'comment' | 'share', postId: number, isExpanded: boolean } | null>(null);
  const [visiblePosts, setVisiblePosts] = useState<Set<number>>(new Set());
  const [videoPlaybackStatus, setVideoPlaybackStatus] = useState<Record<number, boolean>>({});
  const videoPlayerRefs = useRef<Array<React.RefObject<ReactPlayer>>>(postItem.map(() => React.createRef<ReactPlayer>()));
  const videoDivRefs = useRef<Array<React.RefObject<HTMLDivElement>>>(postItem.map(() => React.createRef<HTMLDivElement>()));
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const targetElement = e.target as HTMLElement;
      const isInsideExpandedContainer = targetElement.closest('.expanded-container');
      if (!isInsideExpandedContainer) {
        setIsPostExpanded(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isPostExpanded) {
        setIsPostExpanded(null);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPostExpanded]);


  const collapsePost = () => {
    setIsPostExpanded(null);
  };

  const handleMuteToggle = useCallback((postId: number) => {
    setVideoMuteStates(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  }, []);

  useEffect(() => {
    const initialMuteStates = postItem.reduce((acc, post) => {
      acc[post.postId] = true;
      return acc;
    }, {} as { [key: number]: boolean });
    setVideoMuteStates(initialMuteStates);
  }, [postItem]);

  const sendTheViewCount = async (postId: number, userId: number, videoId: number) => {
    try {
      const response = await getPollByPosts({ postId, videoId, userId });
      
    } catch (error) {
      console.error('Error Sending The View Count:', error);
    }
  };

  const openReportModal = (postId: number) => {
    setIsPostExpanded(null);
    setIsReportModalOpen(postId);
  };

  const openAboutAccountModal = (userId: number) => {
    setIsPostExpanded(null);
    setIsAboutAccountModalOpen(userId);
  };

  const closeTaggedUsersModal = () => {
    setIsTaggedUsersOpen(null);
  };

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    videoDivRefs.current = postItem.map(() => React.createRef<HTMLDivElement>());
    videoPlayerRefs.current = postItem.map(() => React.createRef<ReactPlayer>());
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.getAttribute('data-index')!);
        if (!postItem[index]) return;
        setVisiblePosts(prev => {
          const updated = new Set(prev);
          if (entry.isIntersecting) {
            updated.add(index);
          } else {
            updated.delete(index);
          }
          return updated;
        });
      });
    }, {
      threshold: 0.6,
      rootMargin: '0px',
    });
    observerRef.current = observer;
    const attachObserverTimeout = setTimeout(() => {
      videoDivRefs.current.forEach((ref, idx) => {
        if (ref.current) {
          observer.observe(ref.current);
        }
      });
    }, 300);
    return () => {
      clearTimeout(attachObserverTimeout);
      observer.disconnect();
    };
  }, [postItem]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let topVisibleIndex: number | null = null;
      for (const index of Array.from(visiblePosts)) {
        if (topVisibleIndex === null || index < topVisibleIndex) {
          topVisibleIndex = index;
        }
      }
      if (topVisibleIndex !== activeVideoIndex) {
        setActiveVideoIndex(topVisibleIndex);
        if (topVisibleIndex !== null) {
          const post = postItem[topVisibleIndex];
          const videoId = post?.isForInteractiveVideo === 1 ?
            (post.interactiveVideo ? JSON.parse(post.interactiveVideo.toString())[0]?.video_id ?? 0 : 0) : 0;
          if (post) {
            sendTheViewCount(post.postId, userId, videoId);
          }
        }
      }
      const newStatus: Record<number, boolean> = {};
      postItem.forEach((post, index) => {
        newStatus[post.postId] = index === topVisibleIndex;
      });
      setVideoPlaybackStatus(newStatus);
    }, 500);
    return () => clearTimeout(timer);
  }, [visiblePosts, postItem, activeVideoIndex, userId]);

  const handleScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMorePosts();
    }
  }, [loadMorePosts]);

  useEffect(() => {
    if (!postItem || postItem.length === 0) return;
    const currentPost = postItem[currentIndex];
    if (currentPost?.interactiveVideo) {
      const interactiveVideos = JSON.parse(currentPost.interactiveVideo.toString());
      setAllCurrentVideos(interactiveVideos);
      const rawVideoPath = interactiveVideos[currentIndex]?.path || '';
      const newVideoUrl = rawVideoPath.replace('https://d1332u4stxguh3.cloudfront.net/', '/video/');
      if (newVideoUrl !== videoUrl) {
        setVideoUrl(newVideoUrl);
      }
    }
  }, [postItem, currentIndex, videoUrl]);

  useEffect(() => {
    if (profilePostId) {
      const element = document.getElementById(profilePostId.toString());
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [profilePostId, postItem]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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

  const updatePost = (postId: number, property: string, isBeforeUpdate: number) => {
    if (property === 'like') {
      isBeforeUpdate ?
        setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, isLiked: 0, likeCount: post.likeCount - 1 } : post)) :
        setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, isLiked: 1, likeCount: post.likeCount + 1 } : post));
    } else if (property === 'save') {
      isBeforeUpdate ?
        setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, isSaved: 0, saveCount: post.saveCount - 1 } : post)) :
        setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, isSaved: 1, saveCount: post.saveCount + 1 } : post));
    } else if (property === 'delete') {
      setPostItem((prev) => prev.filter(post => post.postId !== postId));
    } else if (property === 'block' || property === 'hide') {
      refreshPage();
    } else if (property === 'share') {
      setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, shareCount: post.shareCount + isBeforeUpdate } : post));
    } else if (property === 'comment') {
      setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, commentCount: post.commentCount + isBeforeUpdate } : post));
    }
  };

  const fecthInsights = async (posts: PostlistItem) => {
    setIsPostExpanded(null);
    try {
      const interactiveJson = JSON.parse(posts.interactiveVideo.toString());
setIsModalOpen(true);
const response = await fetchInsights({
  postId: posts.postId, 
  videoId: interactiveJson[0]?.video_id ?? 0
});
      if (response.isSuccess) {
setInsightsData(response.data);
        setPostInsightsModalCoverfile(posts?.coverFile ?? '');
      }
    } catch (error) {
      console.error('Error fecthInsights:', error);
    }
  };

  const fecthInsightsPosts = async (postId: number, posts: PostlistItem) => {
    setIsPostExpanded(null);
    try {
      setisPostsModalOpen(true);
      const response = await fetchInsightsPosts(postId);
      if (response.isSuccess) {
setPostInsightsData(response.data);
        setPostInsightsModalCoverfile(posts?.coverFile ?? '');
      }
    } catch (error) {
      console.error('Error fecthInsights:', error);
    }
  };

  const fecthVideoPostInsights = async (postId: number, videoId: number) => {
    try {
      const response = await fetchInsights({postId, videoId});
      if (response.isSuccess) {
setInsightsData(response.data);
      }
    } catch (error) {
      console.error('Error fecthInsights:', error);
    }
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center relative">
      <div
        className={`fixed inset-0 bg-bg-color/10 backdrop-blur-sm transition-all duration-300 hidden xl:block
        ${isPostExpanded ? 'xl:opacity-100 xl:visible' : 'xl:opacity-0 xl:invisible'}`}
        style={{ zIndex: 40 }}
      />
      {postItem.map((post: PostlistItem, index: number) => {
        const videoFile = post?.videoFile[0];
        const baseUrls = [
          'https://d198g8637lsfvs.cloudfront.net/',
          'https://d1332u4stxguh3.cloudfront.net/'
        ];
        let newVideoUrl = videoFile;
        if (videoFile && typeof videoFile === 'string') {
          if (videoFile.startsWith(baseUrls[0])) {
            newVideoUrl = videoFile.replace(baseUrls[0], '/video/');
          } else if (videoFile.startsWith(baseUrls[1])) {
            newVideoUrl = videoFile.replace(baseUrls[1], '/interactivevideo/');
          }
        }
        const isThisVideoPlaying = videoPlaybackStatus[post.postId] ?? true;
        return (
          <div
            key={`${post.postId}-${index + 1}`}
            id={`${post.postId}`}
            className={`
             md:p-4 rounded-lg relative max-w-lg transition-transform duration-300 ease-in-out bg-bg-color expanded-container
            ${isPostExpanded?.postId === post.postId ? 'xl:-translate-x-1/2 xl:w-1/2' : 'xl:translate-x-0'}
             `}
            style={{ zIndex: isPostExpanded?.postId === post.postId ? 50 : 'auto' }}
          >
            <div className="flex items-center justify-between mb-4 w-full">
              <div className='flex items-start gap-2'>
                <button
                  onClick={() => {
                    redirectUser(post.userId, `/home/users/${post.userId}`);
                  }}
                  className='flex items-center'
                >
                  <Avatar src={post.userProfileImage} name={post.userFullName || post.userName} />
                  <div className="ml-2 flex flex-col">
                    <p className="font-bold text-text-color">{post.userName}</p>
                    <p className="text-start text-sm text-text-color">{post.postLocation ? post.postLocation[0] ? post.postLocation[0].locationName : '\u00A0' : '\u00A0'}</p>
                  </div>
                </button>
                {userId !== post.userId && (
                  <div className="p-1">
                    <FollowButton requestId={post.userId} isFollowing={post.isFriend} />
                  </div>
                )}
              </div>
              <div className='flex gap-2'>
                <button
                  className=" text-text-color"
                  onClick={() => setOpenMoreOptions(post.postId)}
                >
                  <FiMoreHorizontal />
                </button>
              </div>
            </div>
            {post.postTitle && <PostTitle description={post.postTitle} taggedUsers={post.postTagUser} />}
            {post.isForInteractiveImage === 1 && post.coverFile && (
              <div className="relative">
                <ImageSlider images={post.interactiveVideo} />
                <div className="absolute bottom-5 left-2 gap-2 right-4 flex justify-start items-center z-20">
                  {post.postTagUser.length > 0 && (
                    <div
                      className="flex items-center gap-2 p-2 bg-bg-color rounded-full text-text-color hover:bg-opacity-80 transition-all cursor-pointer"
                      onClick={() => setIsTaggedUsersOpen(post.postId)}
                    >
                      <BiUserPin className="h-4 w-4" />
                    </div>
                  )}
                  {(post.userId.toString() === userId.toString()) && (
                    <button
                      onClick={() => fecthInsightsPosts(post.postId, post)}
                      className="flex items-center gap-2 p-2 bg-bg-color rounded-full text-text-color hover:bg-opacity-80 transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 20h20" />
                        <path d="M5 4v16" />
                        <path d="M9 4v16" />
                        <path d="M13 4v16" />
                        <path d="M17 4v16" />
                      </svg>
                      <span className="text-sm">Insights</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            {newVideoUrl && (
              <div
                className="relative w-full flex justify-center items-center h-[550px] overflow-hidden bg-primary-bg-color dark-gray-600 rounded-lg max-md:my-2"
                ref={videoDivRefs.current[index]}
                data-index={index}
              >
                <button onClick={() => handleRedirect('snips', post, index)}>
                  <VideoPlayerWidget
                    videoUrl={newVideoUrl}
                    isMuted={videoMuteStates[post.postId] || !isThisVideoPlaying}
                    handleMute={() => handleMuteToggle(post.postId)}
                    isPlaying={activeVideoIndex === index}
                    // isPlaying={true}
                    handleNext={() => setCurrentIndex(index + 1)}
                    setCurrentTime={() => { }}
                    jumpDuration={0}
                    currentTime={0}
                    allCurrentVideos={allCurrentVideos}
                    currentVideoIndex={0}
                    currentPost={post}
                    updateCurrentIndex={(i, indexOfButton) => { }}
                    currentIndex={index}
                    displayType={1}
                    onHomeScreen={true}
                    videoRef={videoPlayerRefs.current[index]}
                    key={'posts-' + index}
                  />
                </button>
                <div className="absolute bottom-9 left-4 right-4 flex justify-between items-center z-20">
                  <div className='flex gap-2'>
                    {post.postTagUser.length > 0 && (
                      <div
                        className="flex items-center gap-2 p-2 bg-bg-color rounded-full text-text-color"
                        onClick={() => setIsTaggedUsersOpen(post.postId)}
                      >
                        <BiUserPin />
                      </div>
                    )}
                    {(post.userId.toString() === userId.toString()) && (
                      <button
                        onClick={() => fecthInsights(post)}
                        className="flex items-center gap-2 p-2 bg-bg-color rounded-full text-text-color"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 20h20" />
                          <path d="M5 4v16" />
                          <path d="M9 4v16" />
                          <path d="M13 4v16" />
                          <path d="M17 4v16" />
                        </svg>
                        <span className="text-sm">Insights</span>
                      </button>
                    )}
                  </div>
                  <button
                    className="p-2 bg-primary-bg-color rounded-full text-text-color"
                    onClick={() => handleMuteToggle(post.postId)}
                  >
                    {videoMuteStates[post.postId] ? <HiOutlineSpeakerXMark /> : <HiOutlineSpeakerWave />}
                  </button>
                </div>
              </div>
            )}
            {openMoreOptions === post.postId && <MoreOptions post={post} setIsOpen={setOpenMoreOptions} openReport={openReportModal} updatePost={updatePost} page='followers' openAboutAccount={openAboutAccountModal} />}
            <LikeCommentShare
              post={post}
              updatePost={updatePost}
              isPost={true}
              setIsPostExpanded={setIsPostExpanded}
            />
            <div
              className={`bg-bg-color rounded-md xl:ml-5
               absolute bottom-0 left-0 w-full md:p-4 xl:h-full h-96
               transition-all duration-300 ease-in-out
              ${isPostExpanded?.postId !== post.postId && 'hidden'}
              ${isPostExpanded?.isExpanded ? "xl:translate-x-full xl:opacity-100" : "xl:translate-x-0 xl:opacity-0"}`}
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
                  closeModal={() => { collapsePost(); }}
                />}
              {isPostExpanded?.type === 'share' &&
                <SharePostModal
                  data={post}
                  type={7}
                  onClose={() => { collapsePost(); }}
                  postId={post.postId}
                  updatePost={updatePost}
                  isModal={false}
                />}
            </div>
          </div>
        );
      })}
      {isModalOpen && insightsData && (
        <InsightsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setInsightsData(null);
            setPostInsightsModalCoverfile('');
          }}
          data={insightsData}
          fecthVideoPostInsights={fecthVideoPostInsights}
          postInsightsModalCoverfile={postInsightsModalCoverfile}
        />
      )}
      {isPostsModalOpen && postInsightsData && (
        <PostInsightsModal
          isOpen={isPostsModalOpen}
          onClose={() => {
            setisPostsModalOpen(false);
            setPostInsightsData(null);
            setPostInsightsModalCoverfile('');
          }}
          data={postInsightsData}
          postInsightsModalCoverfile={postInsightsModalCoverfile}
          aspect={16 / 9}
        />
      )}
      {isReportModalOpen && <ReportModal postId={isReportModalOpen} onClose={() => { setIsReportModalOpen(null); }} />}
      {isAboutAccountModalOpen && <AboutAccountModal userId={isAboutAccountModalOpen} onClose={() => { setIsAboutAccountModalOpen(null); }} />}
    </div>
  );
};

export default Flix;