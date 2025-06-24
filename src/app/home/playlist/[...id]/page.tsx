"use client"
import CommentsSection from '@/components/CommentUi/CommentUi'
import { RecommendedVideosSkeleton } from '@/components/Skeletons/Skeletons'
import PlaylistVideoModal from '@/components/modal/PlaylistVideoModal'
import SafeImage from '@/components/shared/SafeImage'
import { useInAppRedirection } from '@/context/InAppRedirectionContext'
import useLocalStorage from '@/hooks/useLocalStorage'
import { PostlistItem } from '@/models/postlistResponse'
import { getFlixList, GetPostListRequest } from '@/services/auth/flixlist'
import { getFlixDetails } from '@/services/getflixdetails'
import { getPlaylistVideos } from '@/services/getplaylistflixdetails'
import { formatVideoRuntime } from '@/utils/features'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaPlay } from 'react-icons/fa'

const PlaylistPage = () => {
    const router = useRouter();
    const { inAppFlixData, allVideos, clearFlixData, setInAppFlixData } = useInAppRedirection()
    const [selectedVideo, setSelectedVideo] = useState<PostlistItem | null>(
        inAppFlixData || (allVideos && allVideos.length > 0 ? allVideos[0] : null)
    );
    const [error, setError] = useState<string | null>(null);
    const [recommendedVideos, setRecommendedVideos] = useState<PostlistItem[]>([]);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState<boolean>(false);
    const [recommendationsPage, setRecommendationsPage] = useState(1);
    const [recommendationsHasMore, setRecommendationsHasMore] = useState(true);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);

    // Use this ref to prevent infinite API call loops
    const recommendationsLoaded = useRef(false);
    const params = useParams();
    const postId = Array.isArray(params?.id) && params.id.length >= 2 ? params.id[0] : null;
    const playlistId = Array.isArray(params?.id) && params.id.length >= 2 ? params.id[1] : null;
    const [storedUserId] = useLocalStorage<string>('userId', '');
    const recommendationsLimit = 10;

    const [videos, setVideos] = useState<PostlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { setAllVideos } = useInAppRedirection();
    const numericPlaylistId = Number(playlistId);

    // Refs for infinite scroll
    const videoListRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPlaylistVideos = async () => {
            setLoading(true);
            try {
                const response = await getPlaylistVideos({ playlistId: numericPlaylistId });
                if (response.isSuccess && response.data) {
                    setVideos(response.data);
                    setAllVideos(response.data);
                    if (response.data.length > 0) {
                        const matchingVideo = response.data.find(video => video.postId.toString() === postId);
                        setSelectedVideo(matchingVideo!);
                    }
                } else {
                    setError(response.message || "Failed to load playlist videos");
                }
            } catch (error) {
                console.error("Failed to fetch playlist videos:", error);
                setError("Failed to fetch playlist videos");
            } finally {
                setLoading(false);
            }
        };

        if (playlistId) {
            fetchPlaylistVideos();
        }
    }, [playlistId]);

    useEffect(() => {
        const fetchInitialFlix = async () => {
            // Only run this logic on initial load if flix data is missing
            // Add storedUserId check to ensure localStorage has loaded
            if (!inAppFlixData && !selectedVideo && postId && storedUserId) {
                try {
                    const userId = storedUserId;
                    const parsedUserId = userId ? parseInt(userId) : null;

                    // Better validation to handle edge cases
                    const hasValidPostId = postId != null && postId.toString().trim() !== '';
                    const hasValidUserId = parsedUserId !== null && !Number.isNaN(parsedUserId) && parsedUserId >= 0;

                    if (hasValidPostId && hasValidUserId) {
                        const res = await getFlixDetails(parseInt(postId), parsedUserId);

                        if (res.isSuccess && res.data) {
                            setInAppFlixData(res.data);
                            const matchingVideo = res.data.find(video => video.postId.toString() === postId);
                            setSelectedVideo(matchingVideo!); // Set matching video as selected
                        } else {
                            setError(res.message || 'Flix not found');
                        }
                    } else {
                        setError('Invalid userId or postId');
                    }
                } catch (err) {
                    setError('Failed to load flix data');
                    console.error(err);
                }
            }
        };

        // Only fetch recommended videos if we don't have initial data to load
        if (!postId || inAppFlixData) {
            setRecommendationsPage(1);
        }

        fetchInitialFlix();
    }, [postId, inAppFlixData, storedUserId]); // Add storedUserId to dependencies

    // Ensure selected video updates when allVideos changes
    useEffect(() => {
        if (!selectedVideo && allVideos && allVideos.length > 0) {
            const currentVideo = allVideos.find(video => video.postId === postId);
            if (!currentVideo && allVideos.length > 0) {
                setSelectedVideo(currentVideo);
            }
        }
    }, [allVideos, selectedVideo]);

    const fetchRecommendedVideos = async (video?: PostlistItem) => {
        if (recommendationsLoading) return; // Prevent multiple simultaneous requests

        setRecommendationsLoading(true);
        try {
            const postData: GetPostListRequest = {
                isForVideo: "1",
                isForYou: "1",
                isLogin: 1,
                limit: recommendationsLimit,
                offset: (recommendationsPage - 1) * recommendationsLimit,
                isShuffle: 1,
                ...(video && { relatedToPostId: video.postId })
            };

            const response = await getFlixList(postData);
            if (response.isSuccess && response.data) {
                const playlistVideoIds = new Set(allVideos.map((video) => video.postId));
                const filteredRecommendations = response.data.filter(
                    (video) => !playlistVideoIds.has(video.postId)
                );

                if (recommendationsPage === 1) {
                    setRecommendedVideos(filteredRecommendations);
                } else {
                    setRecommendedVideos((prev) => [...prev, ...filteredRecommendations]);
                }

                if (response.data.length < recommendationsLimit) {
                    setRecommendationsHasMore(false); // No more data to fetch
                } else {
                    setRecommendationsHasMore(true);
                }
                recommendationsLoaded.current = true; // Only mark as loaded after successful data fetch
            } else {
                setRecommendationsHasMore(false);
            }
        } catch (err) {
            console.error("Failed to fetch recommended videos:", err);
        } finally {
            setRecommendationsLoading(false);
        }
    };

    // Infinite scroll setup for recommended videos
    useEffect(() => {
        const currentLoadingTrigger = loadingTriggerRef.current;

        if (!currentLoadingTrigger) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && recommendationsHasMore && !recommendationsLoading) {
                    setRecommendationsPage((prevPage) => prevPage + 1);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        observerRef.current.observe(currentLoadingTrigger);

        return () => {
            if (observerRef.current && currentLoadingTrigger) {
                observerRef.current.unobserve(currentLoadingTrigger);
            }
        };
    }, [recommendationsHasMore, recommendationsLoading]);

    useEffect(() => {
        if (selectedVideo) {
            fetchRecommendedVideos(selectedVideo);
        } else {
            fetchRecommendedVideos();
        }
    }, [recommendationsPage, selectedVideo])

    const handleVideoClick = useCallback((video: PostlistItem) => {
        router.push(`/home/playlist/${video.postId}/${playlistId}`);
    }, []);

    const handleRecommendedVideoClick = useCallback((video: PostlistItem) => {
        clearFlixData();
        // Convert SearchResultItem to PostlistItem
        const formattedData = 'id' in video ? {
            postId: video.id, // This is the source of the issue
            postTitle: video.postTitle,
            userFullName: video.userName,
            coverFile: video.coverFile,
            userProfileImage: video.userProfileImage,
            userId: video.userId,
            // Add other required PostlistItem fields with defaults
            viewCounts: 0,
            scheduleTime: new Date().toISOString(),
            isLiked: 0,
            likeCount: 0,
            isSaved: 0,
            saveCount: 0,
        } : video;

        setInAppFlixData(formattedData);
        // Use the correct postId for navigation
        const postId = 'id' in video ? video.id : video.postId;
        router.push(`/home/flix/${postId}`);
    }, [router]);

    // Determine which videos to display
    const videosToDisplay = (allVideos && allVideos.length > 0 ? allVideos : []);

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    return (
        <>
            <div className='flex w-full max-md:flex-col relative md:overflow-hidden'>
                {/* Playback */}
                <div className='w-full md:w-[68vw] flex justify-center items-center p-4 md:p-5 md:overflow-y-auto'>
                    {selectedVideo ? (
                        <PlaylistVideoModal
                            key={selectedVideo.postId}
                            flix={selectedVideo}
                            setSingleFlixDataModel={setSelectedVideo}
                            isCommentModalOpen={isCommentModalOpen}
                            setIsCommentModalOpen={setIsCommentModalOpen}
                        />
                    ) : (
                        <p className='text-xl'>Select a video to play</p>
                    )}
                </div>

                {/* Display all videos */}
                <div
                    ref={videoListRef}
                    className='w-full md:w-[27vw] block px-4 md:p-4 md:max-h-[95vh] h-full md:overflow-y-auto max-md:pb-20 md:fixed right-0'
                >
                    <div>
                        <h2 className='max-md:hidden text-lg md:text-2xl font-bold mb-4'>
                            {'Series Videos'}
                        </h2>
                        <div className='space-y-4'>
                            {videosToDisplay.map((video, index) => (
                                <div
                                    key={video.postId}
                                    className={`flex items-center space-x-4 cursor-pointer relative ${selectedVideo?.postId === video.postId ? 'bg-primary-bg-color' : 'hover:bg-primary-bg-color'
                                        } rounded-lg shadow-md p-2`}
                                    onClick={() => handleVideoClick(video)}
                                >
                                    <div className='relative flex-shrink-0 w-1/3 aspect-video'>
                                        <SafeImage
                                            src={video.coverFile}
                                            alt={video.postTitle}
                                            videoUrl={video?.videoFile[0]}
                                            width={120}
                                            height={80}
                                            className='w-full h-full object-cover rounded'
                                        />
                                        {selectedVideo?.postId === video.postId && (
                                            <div className='absolute inset-0 flex items-center justify-center bg-bg-color bg-opacity-50 rounded'>
                                                <FaPlay className='text-primary-text-color text-2xl' />
                                            </div>
                                        )}
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className={`text-sm font-medium ${selectedVideo?.postId === video.postId ? 'text-primary-text-color' : 'text-text-color'
                                            }`}>{video.postTitle}</h3>
                                    </div>
                                    {video.audioDuration !== "0" &&
                                        <div className='text-primary-text-color text-sm'>
                                            {formatVideoRuntime(video.audioDuration)}
                                        </div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended Videos Section */}
                    <div className="mt-8 border-t border-border-color pt-4">
                        <h2 className='text-lg md:text-2xl font-bold mb-4 text-text-color'>
                            Recommended For You
                        </h2>
                        <div className='space-y-4'>
                            {recommendedVideos.map((video) => (
                                <div
                                    key={video.postId}
                                    className="flex items-center space-x-4 cursor-pointer relative hover:bg-primary-bg-color rounded-lg shadow-md p-2"
                                    onClick={() => handleRecommendedVideoClick(video)}
                                >
                                    <div className='relative flex-shrink-0 w-1/3 aspect-video'>
                                        <SafeImage
                                            src={video.coverFile}
                                            alt={video.postTitle}
                                            videoUrl={video?.videoFile[0]}
                                            width={120}
                                            height={80}
                                            className='w-full h-full object-cover rounded'
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className='text-sm font-medium text-text-color'>{video.postTitle}</h3>
                                    </div>
                                    {video.audioDuration !== "0" &&
                                        <div className='text-primary-text-color text-sm'>
                                            {formatVideoRuntime(Number(video.audioDuration))}
                                        </div>}
                                </div>
                            ))}

                            {/* Infinite scroll trigger and loading indicator for recommended videos */}
                            {recommendationsHasMore && (
                                <div ref={loadingTriggerRef} className="py-4">
                                    {recommendationsLoading && (
                                        <RecommendedVideosSkeleton count={3} />
                                    )}
                                </div>
                            )}

                            {!recommendationsHasMore && recommendedVideos.length > 0 && (
                                <p className='text-center text-gray-500 mt-4 py-4'>
                                    You&apos;ve reached the end
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isCommentModalOpen && selectedVideo && (
                <div className="absolute bottom-0 left-0 w-full max-h-[67vh] z-50">
                    <CommentsSection
                        flixId={selectedVideo?.postId}
                        postOwner={selectedVideo?.userName || selectedVideo?.userFullName}
                        closeModal={() => setIsCommentModalOpen(false)}
                        width="w-full"
                        height="h-[67vh]"
                        isLoggedInPostOwner={selectedVideo.userId === parseInt(storedUserId)}
                        commentsHeight='max-h-[330px]'
                    />
                </div>
            )}
        </>
    )
}

export default PlaylistPage