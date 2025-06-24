"use client"
import CommentsSection from '@/components/CommentUi/CommentUi'
import SeriesVideoModal from '@/components/modal/SeriesVideoModal'
import SafeImage from '@/components/shared/SafeImage'
import { useInAppRedirection } from '@/context/InAppRedirectionContext'
import useLocalStorage from '@/hooks/useLocalStorage'
import { PostlistItem } from '@/models/postlistResponse'
import { getFlixList, GetPostListRequest } from '@/services/auth/flixlist'
import { getFlixDetails } from '@/services/getflixdetails'
import { getSeasonFlix } from '@/services/getseasonflix'
import { formatVideoRuntime, timeAgo } from '@/utils/features'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaPlay } from 'react-icons/fa'

const SeriesPage = () => {
    const params = useParams();
    const router = useRouter();
    const { inAppFlixData, allVideos, setAllVideos, clearFlixData, setInAppFlixData } = useInAppRedirection()
    const [selectedVideo, setSelectedVideo] = useState<PostlistItem | null>(
        inAppFlixData || null
    );
    const [showMobileComments, setShowMobileComments] = useState(false);
    const [seasonVideos, setSeasonVideos] = useState<PostlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoChangeCounter, setVideoChangeCounter] = useState(0);
    const [recommendedVideos, setRecommendedVideos] = useState<PostlistItem[]>([]);
    const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
    const postId = Array.isArray(params?.id) && params.id.length >= 2 ? params.id[0] : null;
    const seriesId = Array.isArray(params?.id) && params.id.length >= 2 ? params.id[1] : null;
    const seasonId = Array.isArray(params?.id) && params.id.length >= 2 ? params.id[2] : null;
    const [storedUserId] = useLocalStorage<string>('userId', '0');
    // Use this ref to prevent infinite API call loops
    const recommendationsLoaded = useRef(false);
    useEffect(() => {
        const fetchInitialData = async () => {
            // Wait for storedUserId to load from localStorage
            if (!postId || storedUserId === '') {
return;
            }

            try {
                setIsLoading(true);

                // Parse and validate userId
                const parsedUserId = parseInt(storedUserId || '0');
                const parsedPostId = parseInt(postId);

                // Validate parsed values
                if (Number.isNaN(parsedPostId) || Number.isNaN(parsedUserId)) {
                    setError('Invalid postId or userId format');
                    return;
                }
// Step 1: Fetch the selected video details using postId
                const flixResponse = await getFlixDetails(parsedPostId, parsedUserId);

                if (flixResponse.isSuccess && flixResponse.data) {
                    setSelectedVideo(flixResponse.data[0]);
                    setInAppFlixData(flixResponse.data);

                    // Only fetch season data if seasonId exists and is valid
                    if (seasonId && seasonId.trim() !== '') {
                        const parsedSeasonId = parseInt(seasonId);

                        if (!Number.isNaN(parsedSeasonId)) {
                            const seasonResponse = await getSeasonFlix({ seasonId: parsedSeasonId });

                            if (seasonResponse.isSuccess && seasonResponse.data) {
                                setSeasonVideos(seasonResponse.data);
                            } else {
setError(seasonResponse.message || 'Failed to fetch season videos');
                            }
                        }
                    }
                } else {
                    setError(flixResponse.message || 'Failed to fetch flix details');
                    return;
                }

                // Fetch recommended videos
                await fetchRecommendedVideos();

            } catch (err) {
                console.error("Fetch error:", err);
                setError("An error occurred while fetching video data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [postId, storedUserId, seasonId]); // Add storedUserId and seasonId to dependencies

    // Load season videos
    useEffect(() => {
        const fetchVideos = async () => {
            if (!inAppFlixData?.seasonId) return;

            setIsLoading(true);
            try {
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
            } catch (err) {
                setError("An error occurred while fetching videos");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };


        fetchVideos();
    }, [inAppFlixData?.seasonId]);

    // Ensure selected video is from current season videos if possible
    useEffect(() => {
        if (selectedVideo && seasonVideos.length > 0) {
            const currentVideo = seasonVideos.find(video => video.postId === selectedVideo.postId);
            if (!currentVideo && seasonVideos.length > 0) {
                setSelectedVideo(currentVideo!);
            }
        }
    }, [seasonVideos]);

    const fetchRecommendedVideos = async () => {
        setIsRecommendedLoading(true);
        try {
const postData: GetPostListRequest = {
                isForVideo: "1",
                isForYou: "1",
                isLogin: 1,
                limit: 10,
                page: 1,
                isShuffle: 1
            };

            const response = await getFlixList(postData);

            if (response.isSuccess && response.data) {
                // Filter out any videos that are already in the season videos
                const seasonVideoIds = new Set(seasonVideos.map(video => video.postId));
                const filteredRecommendations = response.data.filter(
                    video => !seasonVideoIds.has(video.postId)
                );

                setRecommendedVideos(filteredRecommendations);
                recommendationsLoaded.current = true;
            }
        } catch (err) {
            console.error("Failed to fetch recommended videos:", err);
        } finally {
            setIsRecommendedLoading(false);
        }
    };


    // Fetch recommended videos only once when season videos are loaded
    useEffect(() => {
        // Skip if we've already loaded recommendations or if there are no season videos yet
        if (recommendationsLoaded.current || seasonVideos.length === 0) {
            return;
        }

        const fetchRecommendedVideos = async () => {
            setIsRecommendedLoading(true);
            try {
const postData: GetPostListRequest = {
                    isForVideo: "1",
                    isForYou: "1",
                    isLogin: 1,
                    limit: 10,
                    page: 1,
                    isShuffle: 1
                };

                const response = await getFlixList(postData);

                if (response.isSuccess && response.data) {
                    // Filter out any videos that are already in the season videos
                    const seasonVideoIds = new Set(seasonVideos.map(video => video.postId));
                    const filteredRecommendations = response.data.filter(
                        video => !seasonVideoIds.has(video.postId)
                    );

                    setRecommendedVideos(filteredRecommendations);
                    recommendationsLoaded.current = true;
                }
            } catch (err) {
                console.error("Failed to fetch recommended videos:", err);
            } finally {
                setIsRecommendedLoading(false);
            }
        };

        fetchRecommendedVideos();
    }, [seasonVideos]);


    const handleVideoClick = useCallback((video: PostlistItem) => {
        // Increment video change counter to force re-render
        setVideoChangeCounter(prev => prev + 1);
        // setSelectedVideo(video);
        router.push(`/home/series/${video.postId}/${seriesId}/${seasonId}`);
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
    }, []);



    // Determine which videos to display
    const videosToDisplay = seasonVideos;

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
                    {selectedVideo ? (
                        <SeriesVideoModal
                            key={`${selectedVideo.postId}-${videoChangeCounter}`}
                            flix={selectedVideo}
                            setSingleFlixDataModel={setSelectedVideo}
                            setShowMobileComments={setShowMobileComments}
                            showMobileComments={showMobileComments}
                        />
                    ) : (
                        <p className='text-xl'>Select a video to play</p>
                    )}
                </div>

                <div className='md:fixed top-0 right-0 xl:w-[29vw] lg:w-[28vw] md:w-[27vw] block px-4 md:p-4 md:max-h-[95vh] h-full md:overflow-y-auto max-md:pb-20'>
                    <div className="mb-8">
                        <h2 className='max-md:hidden text-lg md:text-2xl font-bold mb-4'>
                            {'Season Episodes'}
                        </h2>
                        <div className='space-y-4'>
                            {videosToDisplay.map((video, index) => (
                                <div
                                    key={video.postId}
                                    className={`flex items-center space-x-4 cursor-pointer relative ${selectedVideo?.postId === video.postId ? 'bg-bg-color' : 'hover:bg-[var(--hover-bg-color)]'
                                        } rounded-lg shadow-md p-2`}
                                    onClick={() => handleVideoClick(video)}
                                >
                                    <div className="mr-4 text-2xl text-primary-text-color font-light w-8 text-center">
                                        {index + 1}
                                    </div>
                                    <div className='relative flex-shrink-0'>
                                    <SafeImage
                                        src={video.coverFile}
                                        alt={video.postTitle}
                                        videoUrl={video?.videoFile[0]}
                                        className='w-[120px] h-[80px] object-cover rounded'
                                    />
                                        {selectedVideo?.postId === video.postId && (
                                            <div className='absolute inset-0 flex items-center justify-center bg-bg-color bg-opacity-50 rounded'>
                                                <FaPlay className='text-primary-text-color text-2xl' />
                                            </div>
                                        )}
                                        {/* Duration overlay at bottom-right */}
                                        {video.audioDuration !== "0" && (
                                            <div className='absolute bottom-1 right-1 bg-bg-color bg-opacity-70 text-primary-text-color text-xs px-1 rounded'>
                                                {formatVideoRuntime(Number(video.audioDuration))}
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
                        </div>
                    </div>

                    {/* Recommended Videos Section */}
                    <div className="mt-8 border-t border-gray-700 pt-4">
                        <h2 className='max-md:hidden text-lg md:text-2xl font-bold mb-4 text-gray-200'>
                            Recommended For You
                        </h2>

                        {isRecommendedLoading ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                            </div>
                        ) : recommendedVideos.length > 0 ? (
                            <div className='space-y-4'>
                                {recommendedVideos.map((video, index) => (
                                    <div
                                        key={video.postId}
                                        className={`flex items-center space-x-4 cursor-pointer relative hover:bg-[var(--hover-bg-color)] rounded-lg shadow-md p-2`}
                                        onClick={() => handleRecommendedVideoClick(video)}
                                    >
                                        <div className='relative flex-shrink-0'>
                                            <SafeImage
                                                src={video.coverFile}
                                                alt={video.postTitle}
                                                videoUrl={video?.videoFile[0]}
                                                width={120}
                                                height={80}
                                                className='w-[120px] h-[80px] object-cover rounded'
                                            />
                                            {/* Duration overlay at bottom-right */}
                                            {video.audioDuration !== "0" && (
                                                <div className='absolute bottom-1 right-1 bg-bg-color bg-opacity-70 text-primary-text-color text-xs px-1 rounded'>
                                                    {formatVideoRuntime(Number(video.audioDuration))}
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex-1'>
                                            <h3 className='text-sm font-medium text-primary-text-color'>{video.postTitle || 'Untitled Video'}</h3>

                                            <p className='text-xs text-gray-400'>
                                                @{video.userName}
                                            </p>

                                            <p className='text-xs text-gray-400'>
                                                {video.viewCounts} views · {timeAgo(video.scheduleTime)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No recommendations available</p>
                        )}
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

export default SeriesPage