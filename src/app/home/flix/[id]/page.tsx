"use client"
import CommentsSection from '@/components/CommentUi/CommentUi'
import { RecommendedVideosSkeleton } from '@/components/Skeletons/Skeletons'
import FlixVideoModal from '@/components/modal/FlixVideoModal'
import SafeImage from '@/components/shared/SafeImage'
import Suggestion from '@/components/suggestions/Suggestion'
import { useInAppRedirection } from '@/context/InAppRedirectionContext'
import useLocalStorage from '@/hooks/useLocalStorage'
import { PostlistItem } from '@/models/postlistResponse'
import { getFlixList, GetPostListRequest } from '@/services/auth/flixlist'
import { getFlixDetails } from '@/services/getflixdetails'
import { getSeasonFlix } from '@/services/getseasonflix'
import { formatVideoRuntime, timeAgo } from '@/utils/features'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useRef } from 'react'
import { FaPlay } from 'react-icons/fa'

const FlixPage = () => {
    const router = useRouter();
    const { inAppFlixData, allVideos, setAllVideos, clearFlixData, setInAppFlixData } = useInAppRedirection()
    const [selectedVideo, setSelectedVideo] = useState<PostlistItem | null>(
        inAppFlixData || (allVideos && allVideos.length > 0 ? allVideos[0] : null)
    );
    const [showMobileComments, setShowMobileComments] = useState(false);
    const [seasonVideos, setSeasonVideos] = useState<PostlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendationsPage, setRecommendationsPage] = useState(1);
    const [recommendationsHasMore, setRecommendationsHasMore] = useState(true);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);

    const recommendationsLimit = 10;
    const [videoChangeCounter, setVideoChangeCounter] = useState(0);
    const params = useParams();
    const postId = Array.isArray(params!.id) ? params!.id[0] : params!.id; // Ensure postId is a string
    const [storedUserId] = useLocalStorage<string>('userId', '');

    const [isLoadingVideoDetails, setIsLoadingVideoDetails] = useState(false);

    // Refs for infinite scroll
    const videoListRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchInitialFlix = async () => {
            // If we have inAppFlixData, check if it has interactiveVideo
            if (inAppFlixData) {
                if (inAppFlixData.interactiveVideo) {
                    setSelectedVideo(inAppFlixData);
                    return; // Exit early, no need to fetch
                } else {
                    // Continue to fetch details below
                }
            }

            // Fetch from API if:
            // 1. No inAppFlixData at all, OR
            // 2. inAppFlixData exists but lacks interactiveVideo
            if (postId && storedUserId) {
                setIsLoadingVideoDetails(true); // Set loading state
                try {
                    const userId = storedUserId;
                    const parsedUserId = userId ? parseInt(userId) : null;
                    const hasValidPostId = postId != null && postId.toString().trim() !== '';
                    const hasValidUserId = parsedUserId !== null && !Number.isNaN(parsedUserId) && parsedUserId >= 0;

                    if (hasValidPostId && hasValidUserId) {
                        const res = await getFlixDetails(parseInt(postId), parsedUserId);

                        if (res.isSuccess && res.data && res.data.length > 0) {
                            const detailedFlix = res.data[0];
                            // Update both inAppFlixData and selectedVideo with complete data
                            setInAppFlixData(detailedFlix);
                            setSelectedVideo(detailedFlix);
                        } else {
                            setError(res.message || 'Flix not found');
                        }
                    } else {
                        setError('Invalid userId or postId');
                    }
                } catch (err) {
                    setError('Failed to load flix data');
                    console.error(err);
                } finally {
                    setIsLoadingVideoDetails(false); // Clear loading state
                }
            } else {
            }
        };

        fetchInitialFlix();
    }, [postId, inAppFlixData, setInAppFlixData, storedUserId]);

    // Function to fetch recommended videos
    const fetchRecommendedVideos = useCallback(async (video?: PostlistItem) => {
        if (recommendationsLoading) return; // Prevent multiple simultaneous requests

        try {
            setRecommendationsLoading(true);
            const postData: GetPostListRequest = {
                isForVideo: "1",
                isForYou: "1",
                isLogin: 1,
                limit: recommendationsLimit,
                offset: (recommendationsPage - 1) * recommendationsLimit,
                isShuffle: 1,
                // If you want to base recommendations on the selected video, 
                // you might pass its ID or category here
                ...(video && { relatedToPostId: video.postId })
            };

            const flixListResponse = await getFlixList(postData);

            if (flixListResponse.isSuccess && flixListResponse.data) {
                if (recommendationsPage === 1) {
                    setAllVideos(flixListResponse.data);
                } else {
                    setAllVideos((prev) => [...prev, ...flixListResponse.data]);
                }

                if (flixListResponse.data.length < recommendationsLimit) {
                    setRecommendationsHasMore(false); // No more data to fetch
                } else {
                    setRecommendationsHasMore(true);
                }
            } else {
                setRecommendationsHasMore(false);
            }
        } catch (err) {
            setError("An error occurred while fetching recommended videos");
            console.error(err);
        } finally {
            setRecommendationsLoading(false);
        }
    }, [setAllVideos, recommendationsPage, recommendationsLoading]);

    // Infinite scroll setup
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
        const fetchVideos = async () => {
            setIsLoading(true);
            try {
                // First, check if it's an original series with a season
                if (inAppFlixData?.isOriginal && inAppFlixData.seasonId) {
                    const response = await getSeasonFlix({
                        seasonId: inAppFlixData.seasonId
                    });

                    if (response.isSuccess && response.data) {
                        setSeasonVideos(response.data);

                        // Set first video if no video is selected
                        if (!selectedVideo && response.data.length > 0) {
                            setSelectedVideo(response.data[0]);
                        }
                    } else {
                        setError(response.message || "Failed to fetch season videos");
                    }
                }
                // If no season videos or not an original series, fetch general flix list
                else if (!allVideos || allVideos.length === 0) {
                    setRecommendationsPage(1)
                }
            } catch (err) {
                setError("An error occurred while fetching videos");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, [inAppFlixData, allVideos, fetchRecommendedVideos, selectedVideo]);

    useEffect(() => {
        if (selectedVideo) {
            fetchRecommendedVideos(selectedVideo);
        } else {
            fetchRecommendedVideos();
        }
    }, [recommendationsPage])

    const handleVideoClick = useCallback(async (video: PostlistItem) => {
        // Increment video change counter to force re-render
        setVideoChangeCounter(prev => prev + 1);
        setInAppFlixData(video);
        router.push(`/home/flix/${video.postId}`);

        // Fetch new recommended videos based on the selected video
        setIsLoading(true);
        try {
            setRecommendationsPage(1);
            setSelectedVideo(video);
        } catch (err) {
            console.error("Error fetching recommended videos:", err);
        } finally {
            setIsLoading(false);
        }
    }, [router, setInAppFlixData]);

    // Determine which videos to display
    const videosToDisplay = inAppFlixData?.isOriginal && seasonVideos.length > 0
        ? seasonVideos
        : (allVideos && allVideos.length > 0 ? allVideos : []);

    if (isLoading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    return (
        <>
            <div className='flex w-full max-md:flex-col relative md:overflow-hidden'>
                <div className='w-full md:w-[68vw] flex justify-center items-center p-4 md:p-5 md:overflow-y-auto'>
                    {isLoadingVideoDetails ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            <p className="mt-4">Loading video details...</p>
                        </div>
                    ) : selectedVideo ? (
                        <FlixVideoModal
                            key={`${selectedVideo.postId}-${videoChangeCounter}`}
                            flix={selectedVideo}
                            setSingleFlixDataModel={setSelectedVideo}
                            showMobileComments={showMobileComments}
                            setShowMobileComments={setShowMobileComments}
                        />
                    ) : (
                        <p className='text-xl'>Select a video to play</p>
                    )}
                </div>

                <div
                    ref={videoListRef}
                    className='w-full md:w-[27vw] block px-4 md:p-4 md:max-h-[95vh] h-full md:overflow-y-auto max-md:pb-20 md:fixed right-0'
                >
                    <div>
                        <h2 className='max-md:hidden text-lg md:text-2xl font-bold mb-4'>
                            {inAppFlixData?.isOriginal ? 'Episodes' : 'Recommended Minis'}
                        </h2>
                        <div className='space-y-4'>
                            {videosToDisplay.map((video, index) => (
                                <div
                                    key={video.postId}
                                    className={`flex items-center space-x-4 cursor-pointer relative ${selectedVideo?.postId === video.postId ? 'bg-bg-color' : 'hover:bg-[var(--hover-bg-color)]'
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
                                        {/* Duration overlay at bottom-right */}
                                        {video.audioDuration !== "0" && (
                                            <div className='absolute bottom-1 right-1 bg-bg-color bg-opacity-70 text-primary-text-color text-xs px-1 rounded'>
                                                {formatVideoRuntime(video.audioDuration)}
                                            </div>
                                        )}
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className={`text-sm font-medium ${selectedVideo?.postId === video.postId ? 'text-primary-text-color' : 'text-primary-text-color'
                                            }`}>{video.postTitle || 'Untitled Video'}</h3>

                                        <p className='text-xs text-gray-400'>
                                            @{video.userName}
                                        </p>

                                        <p className='text-xs text-gray-400'>
                                            {video.viewCounts} views · {timeAgo(video.scheduleTime)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Infinite scroll trigger and loading indicator */}
                            {recommendationsHasMore && (
                                <div ref={loadingTriggerRef} className="py-4">
                                    {recommendationsLoading && (
                                        <RecommendedVideosSkeleton count={3} />
                                    )}
                                </div>
                            )}

                            {!recommendationsHasMore && videosToDisplay.length > 0 && (
                                <p className='text-center text-gray-500 mt-4 py-4'>
                                    You&apos;ve reached the end
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showMobileComments && selectedVideo && (
                <div className="absolute bottom-0 left-0 w-full max-h-[67vh] z-50">
                    <CommentsSection
                        flixId={selectedVideo.postId}
                        postOwner={selectedVideo.userFullName || selectedVideo.userName}
                        closeModal={() => setShowMobileComments(false)}
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

export default FlixPage