'use client';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
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
import { savePostLike } from '@/services/savepostlike';
import { timeAgo } from '@/utils/features';
import useUserRedirection from '@/utils/userRedirection';
import { BiUserPin } from 'react-icons/bi';
import Avatar from '../Avatar/Avatar';
import CommentsSection from '../CommentUi/CommentUi';
import FollowButton from '../FollowButton/FollowButton';
import InsightsModal from '../Insights/Insights';
import PostInsightsModal from '../Insights/PostInsights';
import ContentTree from '../Interactive/contentTree';
import MoreOptions from '../MoreOptions';
import PostActivity from '../PostActivity/PostActivity';
import PostTitle from '../PostTitle';
import AboutAccountModal from '../modal/AboutAccountModal';
import PostUsersModal from '../modal/PostUsersModal';
import ReportModal from '../modal/ReportModal';
import SharePostModal from '../modal/SharePostModal';
import ImageSlider from './ImageSlider';
import LikeCommentShare from './LikeCommentShare';
import CyclingLocationAudio from './cyclingLocationAudio';
import useLocalStorage from '@/hooks/useLocalStorage';
const Posts = ({ postData, loadMorePosts, index, isFromSaved, isFromProfile }: { postData: PostlistItem[], loadMorePosts: () => void, index?: number, isFromSaved: boolean, isFromProfile: boolean }) => {

    const [id] = useLocalStorage<string>('userId', '');
    const userId = id ? parseInt(id) : 0;
    const { setInAppSnipsData, setSnipIndex, profilePostId } = useInAppRedirection()
    const router = useRouter();
    const redirectUser = useUserRedirection();
    const [videoMuteStates, setVideoMuteStates] = useState<{ [key: number]: boolean }>({});
    const [postItem, setPostItem] = useState<PostlistItem[]>([]);
    let defaultIndex;
    let selectedPostId: any
    if (index) {
        defaultIndex = index;
        selectedPostId = String(postData[index].postId);
    } else {
        defaultIndex = 0;
        selectedPostId = '0';
    }
    useEffect(() => {
        if (postData && postData.length > 0) {
            setPostItem(postData);
        }
    }, [postData]);


    const [currentIndex, setCurrentIndex] = useState<number>(defaultIndex);
    const [currentVisiblePost, setCurrentVisiblePost] = useState<PostlistItem | null>(null);
    const [allCurrentVideos, setAllCurrentVideos] = useState<VideoList[]>([]);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
    const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState<number | null>(null);
    const [isAboutAccountModalOpen, setIsAboutAccountModalOpen] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPostsModalOpen, setisPostsModalOpen] = useState(false);
    const [postInsightsModalCoverfile, setPostInsightsModalCoverfile] = useState<{ image: string, aspect: number }>({ image: '', aspect: 0 });
    const [insightsData, setInsightsData] = useState<ViewReactionsData | null>(null);
    const [postInsightsData, setPostInsightsData] = useState<ViewReactionsPostData | null>(null);
    const [isPostUsersModalOpen, setIsPostUsersModalOpen] = useState<{ postId: number, isForCollaborators: boolean } | null>(null);
    const [isPostExpanded, setIsPostExpanded] = useState<{ type: 'like' | 'comment' | 'share', postId: number, isExpanded: boolean } | null>(null);
    const [indexOfExpandedPost, setIndexOfExpandedPost] = useState<number | null>(null);
    const [visiblePosts, setVisiblePosts] = useState<Set<number>>(new Set());
    const [videoPlaybackStatus, setVideoPlaybackStatus] = useState<Record<number, boolean>>({});
    const [snipClickTimer, setSnipClickTimer] = useState<NodeJS.Timeout | null>(null);
    const videoPlayerRefs = useRef<Array<React.RefObject<ReactPlayer>>>(postItem.map(() => React.createRef<ReactPlayer>()));
    const videoDivRefs = useRef<Array<React.RefObject<HTMLDivElement>>>(postItem.map(() => React.createRef<HTMLDivElement>()));
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [contentTreeOpen, setContentTreeOpen] = useState<{ postId: number } | null>(null);
    const [audioMuteStates, setAudioMuteStates] = useState<{ [key: number]: boolean }>({});
    const [audioPlaybackStatus, setAudioPlaybackStatus] = useState<Record<number, boolean>>({});
    const audioRefs = useRef<Array<React.RefObject<HTMLAudioElement>>>(postItem.map(() => React.createRef<HTMLAudioElement>()));
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isScrollingProgrammatically = useRef(false);

    useEffect(() => {
        if (isFromSaved || isFromProfile) {
            if (postItem.length > 0 && selectedPostId) {
                const scrollTimeout = setTimeout(() => {
                    const targetPost = document.getElementById(selectedPostId);
                    if (targetPost) {
                        targetPost.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        });
} else {
                        console.warn(`Post with ID ${selectedPostId} not found in the DOM.`);
                    }
                }, 200); // Adjust delay as needed

                return () => clearTimeout(scrollTimeout);
            }
        }
    }, [postItem, selectedPostId]);

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
        if (!isPostExpanded) return;

        let lastScrollY = window.scrollY;

        const handleExpandedPostScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDiff = Math.abs(currentScrollY - lastScrollY);

            if (scrollDiff < 5 || isScrollingProgrammatically.current===true) {
                return
            };

            setIsPostExpanded(null);
        };

        // Use the renamed handler
        window.addEventListener('scroll', handleExpandedPostScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleExpandedPostScroll);
        };
    }, [isPostExpanded]);

    useEffect(() => {
        if (isPostExpanded) {
            const postElement = document.getElementById(`${isPostExpanded.postId}`);

            if (postElement) {
                isScrollingProgrammatically.current = true;

                //timeout to start scrolling after the post as expanded, remove this timer if we want to scroll and expand simultaneously
                const startScroll = setTimeout(() => {
                    postElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);

                //Post will close if scrolled after 600ms, this is to prevent it from closing while it is coming to view through scroll
                const resetScrollFlag = setTimeout(() => {
                    isScrollingProgrammatically.current = false;
                }, 600); 
    
                return () => {
                    clearTimeout(startScroll);
                    clearTimeout(resetScrollFlag);
                }
            }
        }
    }, [isPostExpanded]);

    const collapsePost = () => {
        setIndexOfExpandedPost(null);
        setIsPostExpanded(null);
    }
    const handleMuteToggle = useCallback((postId: number) => {
        setVideoMuteStates(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    }, []);

    const handleAudioMuteToggle = useCallback((postId: number) => {
        setAudioMuteStates(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    }, []);

    useEffect(() => {
        const initialAudioMuteStates = postItem.reduce((acc, post) => {
            acc[post.postId] = true; // Start muted
            return acc;
        }, {} as { [key: number]: boolean });
        setAudioMuteStates(initialAudioMuteStates);
    }, [postItem]);

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
        setIsReportModalOpen(postId)
    }

    const openAboutAccountModal = (userId: number) => {
        setIsPostExpanded(null);
        setIsAboutAccountModalOpen(userId)
    }

    const closePostUsersModal = () => {
        setIsPostUsersModalOpen(null)
    }

    // Update the IntersectionObserver to properly track current visible post
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
            threshold: 0.8,
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

    // Update active video index and current post when visibility changes
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

                if (topVisibleIndex !== null && postItem[topVisibleIndex]) {
                    setCurrentVisiblePost(postItem[topVisibleIndex]);

                    const post = postItem[topVisibleIndex];
                    const videoId = post?.isForInteractiveVideo === 1 ?
                        (post.interactiveVideo ? JSON.parse(post.interactiveVideo.toString())[0]?.video_id ?? 0 : 0) : 0;

                    if (post) {
                        sendTheViewCount(post.postId, userId, videoId);
                    }
                }
            }

            // Update video playback statuses
            const newVideoStatus: Record<number, boolean> = {};
            const newAudioStatus: Record<number, boolean> = {};

            postItem.forEach((post, index) => {
                const isVisible = index === topVisibleIndex;
                newVideoStatus[post.postId] = isVisible;
                newAudioStatus[post.postId] = isVisible;

                // Control audio playback
                if (post.audioFile && audioRefs.current[index]?.current) {
                    const audioElement = audioRefs.current[index].current;
                    if (isVisible && !audioMuteStates[post.postId]) {
                        audioElement!.play().catch(console.error);
                    } else {
                        audioElement!.pause();
                    }
                }
            });

            setVideoPlaybackStatus(newVideoStatus);
            setAudioPlaybackStatus(newAudioStatus);

        }, 200);

        return () => clearTimeout(timer);
    }, [visiblePosts, postItem, activeVideoIndex, userId, audioMuteStates]);

    useEffect(() => {
        if (currentVisiblePost && activeVideoIndex !== null) {
            setCurrentIndex(activeVideoIndex);

            // Update allCurrentVideos when the current post changes
            if (currentVisiblePost?.interactiveVideo) {
                const interactiveVideos = JSON.parse(currentVisiblePost.interactiveVideo.toString());
                setAllCurrentVideos(interactiveVideos);

                const rawVideoPath = interactiveVideos[0]?.path || '';
                const baseUrls = [
                    'https://d198g8637lsfvs.cloudfront.net/',
                    'https://d1332u4stxguh3.cloudfront.net/'
                ];

                let newUrl = rawVideoPath;
                if (rawVideoPath.startsWith(baseUrls[0])) {
                    newUrl = rawVideoPath.replace(baseUrls[0], '/video/');
                } else if (rawVideoPath.startsWith(baseUrls[1])) {
                    newUrl = rawVideoPath.replace(baseUrls[1], '/interactivevideo/');
                }

                setVideoUrl(newUrl);
            }
        }
    }, [currentVisiblePost, activeVideoIndex]);

    const handleInfiniteScroll = useCallback(() => {
        // Prevent multiple simultaneous calls
        if (isLoadingMore || scrollTimeoutRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            setIsLoadingMore(true);

            // Throttle the loadMorePosts call
            scrollTimeoutRef.current = setTimeout(() => {
                loadMorePosts();
                scrollTimeoutRef.current = null;
                // Reset loading state after a delay
                setTimeout(() => setIsLoadingMore(false), 1000);
            }, 300);
        }
    }, [loadMorePosts, isLoadingMore]);

    const handleLike = async (postId: number, isLiked: number) => {
        try {
            if (!postId) return;
            if (!isLiked) { //like only if post is not already liked
                const res = await savePostLike({ postId, isLike: 1 })
                if (res.isSuccess) {
updatePost(postId, 'like', 0)
                }
            }
        } catch (error) {
            console.error('Error liking the video:', error);
        }
    }

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
        if (isFromProfile) {
            if (postItem.length > 0 && profilePostId) {
                const scrollTimeout = setTimeout(() => {
const targetPost = document.getElementById(`${profilePostId}`);
if (targetPost) {
                        targetPost.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        });
} else {
                        console.warn(`Post with ID ${profilePostId} not found in the DOM.`);
                    }
                }, 200); // Adjust delay as needed

                return () => clearTimeout(scrollTimeout);
            }
        }
    }, [profilePostId, postItem])

    useEffect(() => {
        audioRefs.current = postItem.map(() => React.createRef<HTMLAudioElement>());
    }, [postItem])

    useEffect(() => {
        window.addEventListener('scroll', handleInfiniteScroll);
        return () => window.removeEventListener('scroll', handleInfiniteScroll);
    }, [handleInfiniteScroll]);

    const handleRedirect = (type: string, data: any, index: number) => {
        if (type == "snips") {
            if (Array.isArray(data)) {
                const snips = data.filter((item: PostlistItem) => item.isForInteractiveVideo === 1);
                const totalNumberOFImagePost = data.slice(0, index).filter((item: PostlistItem) => item.isForInteractiveImage === 1).length;
                setInAppSnipsData(snips);
                setSnipIndex(index - totalNumberOFImagePost);
            } else {
                const snipsData = []
                snipsData.push(data);
                setInAppSnipsData(snipsData);
            }
            router.push('/home/snips')
        }
    }

    const updatePost = (postId: number, property: string, isBeforeUpdate: number) => {
        if (property === 'like') {
            isBeforeUpdate ? setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, isLiked: 0, likeCount: post.likeCount - 1 } : post)) : setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, isLiked: 1, likeCount: post.likeCount + 1 } : post))
        } else if (property === 'save') {
            isBeforeUpdate ? setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, isSaved: 0, saveCount: post.saveCount - 1 } : post)) : setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, isSaved: 1, saveCount: post.saveCount + 1 } : post))
        } else if (property === 'delete') {
            setPostItem((prev) => prev.filter(post => post.postId !== postId));
        } else if (property === 'block' || property === 'hide') {
            setPostItem((prev) => prev.filter(post => post.userId !== postId)); //postId in function args is actually userId in this case, sent by from MoreOptions component
        } else if (property === 'share') {
            setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, shareCount: post.shareCount + isBeforeUpdate } : post))
        } else if (property === 'comment') {
            setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, commentCount: post.commentCount + isBeforeUpdate } : post))
        } else if (property = "collaboration"){
            setPostItem(prev => prev.map(post => post.postId === postId ? { ...post, userCollab: 0, collaboratorCount: post.collaboratorCount-1,firstCollaboratorName:"" } : post))
        }
    }

    const fecthInsights = async (posts: PostlistItem) => {
        setIsPostExpanded(null);
        try {
            const interactiveJson = JSON.parse(posts.interactiveVideo.toString());
            setIsModalOpen(true)
            const response = await fetchInsights({postId:posts.postId, videoId:interactiveJson[0]?.video_id ?? 0});
            if (response.isSuccess) {
                setInsightsData(response.data);
                setPostInsightsModalCoverfile({ image: posts?.coverFile ?? '', aspect: 0.75 });
            }
        } catch (error) {
            console.error('Error fecthInsights:', error);
        }
    }

    const fecthInsightsPosts = async (postId: number, posts: PostlistItem) => {
        setIsPostExpanded(null);
        const interactiveVideo = posts.interactiveVideo ? JSON.parse(posts.interactiveVideo.toString()) : null;
        const aspect = interactiveVideo ? interactiveVideo[0]?.aspect_ratio : 0.75;
        try {
            setisPostsModalOpen(true)
            const response = await fetchInsightsPosts(postId);
            if (response.isSuccess) {
                setPostInsightsData(response.data);
                setPostInsightsModalCoverfile({ image: posts?.coverFile ?? '', aspect: aspect });
            }
        } catch (error) {
            console.error('Error fecthInsights:', error);
        }
    }

    const fecthVideoPostInsights = async (postId: number, videoId: number) => {
        try {
            const response = await fetchInsights({postId, videoId});
            if (response.isSuccess) {
                setInsightsData(response.data);
            }
        } catch (error) {
            console.error('Error fecthInsights:', error);
        }
    }

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
                const isThisAudioPlaying = audioPlaybackStatus[post.postId] ?? true;

                const audioFile = post?.audioFile;

                let newAudioUrl = audioFile;
                if (audioFile && typeof audioFile === 'string') {
                    if (audioFile.startsWith(baseUrls[0])) {
                        newAudioUrl = audioFile.replace(baseUrls[0], '/audio/');
                    } else if (audioFile.startsWith(baseUrls[1])) {
                        newAudioUrl = audioFile.replace(baseUrls[1], '/audio/');
                    }
                }
                return (
                    <div key={`${post.postId}-${index + 1}`} id={String(post.postId)}
                        className={`
                            md:p-4 rounded-lg relative max-w-[25rem] transition-transform duration-300 ease-in-out bg-bg-color expanded-container w-full
                            ${isPostExpanded?.postId === post.postId ? 'fixed inset-0 xl:-translate-x-1/2 xl:w-1/2' : ''}
                        `}
                        style={{ zIndex: isPostExpanded?.postId === post.postId ? 50 : 'auto' }}
                    >

                        {post.isForInteractiveImage === 1 && (
                            <div className="flex items-center justify-between mb-4 w-full">
                                <div className='flex items-start gap-2'>
                                    <button
                                        onClick={() => {
                                            redirectUser(post.userId, `/home/users/${post.userId}`)
                                        }}
                                        className='flex items-center'>
                                        <Avatar src={post.userProfileImage} name={post.userFullName || post.userName} />
                                        <div className="ml-2 flex flex-col items-start justify-start">
                                            <p className="font-bold text-text-color">
                                                <span>{post.userName}</span>

                                                {post.collaboratorCount > 0 && (
                                                    <span
                                                        className="font-light cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsPostUsersModalOpen({
                                                                postId: post.postId,
                                                                isForCollaborators: true,
                                                            });
                                                        }}
                                                    >
                                                        {post.collaboratorCount === 1
                                                            ? ` with ${post.firstCollaboratorName}`
                                                            : ` with ${post.collaboratorCount} others`}
                                                    </span>
                                                )}
                                            </p>

                                            <CyclingLocationAudio post={post} />
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
                                        className=" text-text-color relative"
                                        onClick={() => setOpenMoreOptions(post.postId)}
                                    >
                                        <FiMoreVertical />
                                        {openMoreOptions === post.postId && <MoreOptions post={post} setIsOpen={setOpenMoreOptions} openReport={openReportModal} updatePost={updatePost} page='followers' openAboutAccount={openAboutAccountModal} />}
                                    </button>
                                </div>
                            </div>
                        )}
                        {post.isForInteractiveImage === 1 && post.coverFile && (
                            <div
                                className="relative"
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleLike(post.postId, post.isLiked);
                                }}
                                ref={videoDivRefs.current[index]}
                                data-index={index}
                            >
                                <ImageSlider images={post.interactiveVideo} />

                                {/* Audio element for image posts - hidden audio player */}
                                {post.audioFile && newAudioUrl && (
                                    <audio
                                        ref={audioRefs.current[index]}
                                        src={newAudioUrl}
                                        muted={audioMuteStates[post.postId]}
                                        loop
                                        onPlay={() => {
                                            if (!isThisAudioPlaying) {
                                                audioRefs.current[index]?.current?.pause();
                                            }
                                        }}
                                        style={{ display: 'none' }} // Hidden audio player
                                    />
                                )}

                                <div className="absolute bottom-5 left-4 gap-2 right-4 flex justify-end items-center z-20">
                                    <div className="flex gap-2 justify-end">
                                        {post.postTagUser.length > 0 && <div
                                            className="flex items-center p-2 bg-bg-color rounded-full text-text-color hover:bg-opacity-80 transition-all cursor-pointer"
                                            onClick={() => setIsPostUsersModalOpen({ postId: post.postId, isForCollaborators: false })}
                                        >
                                            <BiUserPin className="h-4 w-4" />
                                        </div>}

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

                                        {post.audioFile && newAudioUrl && (
                                            <button
                                                className="p-2 bg-bg-color rounded-full text-text-color hover:bg-opacity-80 transition-all"
                                                onClick={() => handleAudioMuteToggle(post.postId)}
                                            >
                                                {audioMuteStates[post.postId] ? (
                                                    <HiOutlineSpeakerXMark className="h-4 w-4" />
                                                ) : (
                                                    <HiOutlineSpeakerWave className="h-4 w-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {post.isForInteractiveVideo === 1 && newVideoUrl && (
                            <div
                                className="relative flex justify-center items-center overflow-hidden dark-gray-600 rounded-lg"
                                ref={videoDivRefs.current[index]}
                                data-index={index}
                            >
                                <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center">
                                    {/* Left side: Avatar, username, location, collaborators, FollowButton */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => redirectUser(post.userId, `/home/users/${post.userId}`)}
                                            className="flex items-center"
                                        >
                                            <Avatar src={post.userProfileImage} name={post.userFullName || post.userName} />
                                            <div className="ml-2 flex flex-col justify-center">
                                                <p className="font-bold text-white flex items-center flex-wrap gap-2">
                                                    <span>{post.userName}</span>

                                                    {post.collaboratorCount > 0 && (
                                                        <span
                                                            className="font-light text-white cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsPostUsersModalOpen({ postId: post.postId, isForCollaborators: true });
                                                            }}
                                                        >
                                                            {post.collaboratorCount === 1
                                                                ? `with ${post.firstCollaboratorName}`
                                                                : `with ${post.collaboratorCount} others`}
                                                        </span>
                                                    )}

                                                </p>

                                                {post.postLocation?.[0]?.locationName && (
                                                    <p className="text-start text-sm text-white">
                                                        {post.postLocation[0].locationName}
                                                    </p>
                                                )}
                                            </div>
                                            {userId !== post.userId && (
                                                <FollowButton requestId={post.userId} isFollowing={post.isFriend} isForInteractiveImage={true} />
                                            )}

                                        </button>
                                    </div>

                                    {/* Right side: {I} badge and MoreOptions */}
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

                                        <button
                                            className="text-white relative"
                                            onClick={() => setOpenMoreOptions(post.postId)}
                                        >
                                            <FiMoreVertical />
                                            {openMoreOptions === post.postId && (
                                                <MoreOptions
                                                    post={post}
                                                    setIsOpen={setOpenMoreOptions}
                                                    openReport={openReportModal}
                                                    updatePost={updatePost}
                                                    page="followers"
                                                    openAboutAccount={openAboutAccountModal}
                                                />
                                            )}
                                        </button>
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
                                        showInteractiveElements={false}
                                    />
                                </button>
                                <div className="absolute bottom-5 left-4 right-4 flex justify-between items-center z-20">
                                    <div className='flex gap-2'>
                                        {post.postTagUser.length > 0 && <div
                                            className="flex items-center p-2 bg-bg-color rounded-full text-text-color"
                                            onClick={() => setIsPostUsersModalOpen({ postId: post.postId, isForCollaborators: false })}
                                        >
                                            <BiUserPin />
                                        </div>}
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
                        <div onClick={() => setIndexOfExpandedPost(index)}>
                            <LikeCommentShare
                                post={post}
                                updatePost={updatePost}
                                isPost={true}
                                setIsPostExpanded={setIsPostExpanded}
                            />
                        </div>


                        {post.postTitle && <PostTitle description={post.postTitle} taggedUsers={post.postTagUser} userName={post.userName} userId={post.userId}/>}
                        <p className="font-thin text-sm mt-2">{timeAgo(post.scheduleTime)}</p>

                        <div
                            className={`xl:bg-bg-color rounded-md xl:ml-5 
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

                        {isPostUsersModalOpen?.postId === post.postId && <PostUsersModal taggedUsers={post.postTagUser} onClose={closePostUsersModal} postId={post.postId} isForCollaborators={isPostUsersModalOpen.isForCollaborators} />}
                    </div>
                );
            })}
            {isModalOpen && insightsData && (
                <InsightsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setInsightsData(null);
                        setPostInsightsModalCoverfile({ image: '', aspect: 0.75 });
                    }}
                    data={insightsData}
                    fecthVideoPostInsights={fecthVideoPostInsights}
                    postInsightsModalCoverfile={postInsightsModalCoverfile.image}

                />
            )}
            {isPostsModalOpen && postInsightsData && (
                <PostInsightsModal
                    isOpen={isPostsModalOpen}
                    onClose={() => {
                        setisPostsModalOpen(false);
                        setPostInsightsData(null);
                        setPostInsightsModalCoverfile({ image: '', aspect: 0.75 });
                    }}
                    data={postInsightsData}
                    postInsightsModalCoverfile={postInsightsModalCoverfile.image}
                    aspect={postInsightsModalCoverfile.aspect}
                />
            )}
            {isReportModalOpen && <ReportModal postId={isReportModalOpen} onClose={() => { setIsReportModalOpen(null) }} />}
            {isAboutAccountModalOpen && <AboutAccountModal userId={isAboutAccountModalOpen} onClose={() => { setIsAboutAccountModalOpen(null) }} />}
            {contentTreeOpen && (
                <ContentTree
                    postId={contentTreeOpen.postId}
                    onClose={() => setContentTreeOpen(null)}
                />
            )}
        </div>
    );
};

export default Posts;