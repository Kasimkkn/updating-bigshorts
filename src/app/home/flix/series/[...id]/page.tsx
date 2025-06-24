"use client"
import {
    SeasonInfoSkeleton,
    EpisodeLoadingSkeleton,
    RecommendedVideosSkeleton
} from '@/components/Skeletons/Skeletons'
import FlixVideoModal from '@/components/modal/FlixVideoModal'
import Button from '@/components/shared/Button'
import { useInAppRedirection } from '@/context/InAppRedirectionContext'
import { PostlistItem } from '@/models/postlistResponse'
import { getSeasonDetails, SeasonData } from '@/services/getseasondetails'
import { getSeasonFlix } from '@/services/getseasonflix'
import { getFlixList, GetPostListRequest } from '@/services/auth/flixlist'
import React, { useCallback, useEffect, useState } from 'react'
import { FaChevronLeft, FaPlay } from 'react-icons/fa'
import { IoChevronDownSharp } from 'react-icons/io5'
import { formatVideoRuntime } from '@/utils/features'
import CommentsSection from '@/components/CommentUi/CommentUi'
import useLocalStorage from '@/hooks/useLocalStorage'
import SafeImage from '@/components/shared/SafeImage'

const SeriesPage = () => {
    const { seriesData, setInAppFlixData } = useInAppRedirection();
    const seriesId = seriesData?.id;
    const seasonList = seriesData?.seasons;
    const [isLoading, setIsLoading] = useState(false);
    const [currentSeason, setCurrentSeason] = useState<number>(0);
    const [seasonData, setSeasonData] = useState<SeasonData | null>(null)
    const [isSeasonDropdown, setIsSeasonDropdown] = useState(false);
    const [episodes, setEpisodes] = useState<PostlistItem[] | null>(null);
    const [isEpisodePlaying, setIsEpisodePlaying] = useState(false);
    const [isEpisodeLoading, setIsEpisodeLoading] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState<number | null>(null);
    const [flixDatamodel, setFlixDataModel] = useState<PostlistItem | null>(null);
    const [recommendedVideos, setRecommendedVideos] = useState<PostlistItem[]>([]);
    const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
    const [showMobileComments, setShowMobileComments] = useState(false);
    const [storedUserId] = useLocalStorage<string>('userId', '');

    const toggleSeasonDropdown = () => {
        setIsSeasonDropdown(!isSeasonDropdown);
    }

    const fetchSeasonDetails = useCallback(async () => {
        if (seriesId && seasonList) {
            setIsLoading(true);
            try {
                const response = await getSeasonDetails({ series_id: seriesId, season_id: seasonList[currentSeason].id });
                if (response.isSuccess && response.data) {
                    setSeasonData(response.data);
                } else {
                    console.error("Failed to fetch series list");
                }
            } catch (error) {
                console.error("Failed to fetch season details:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [seriesId, seasonList, currentSeason]);

    // Then add it to the useEffect dependency array:
    useEffect(() => {
        setIsLoading(true)
        fetchSeasonDetails();
        setCurrentEpisode(null);
        setEpisodes(null);
        setIsEpisodePlaying(false);
    }, [currentSeason, fetchSeasonDetails]);
    const fetchSeasonFlix = async (seasonId: number) => {
        setIsEpisodeLoading(true);
        try {
            const response = await getSeasonFlix({ seasonId: seasonId });
            if (response.isSuccess && response.data) {
                setEpisodes(response.data);
            } else {
                console.error("Failed to fetch episodes");
            }
        } catch (error) {
            console.error("Failed to fetch episodes:", error);
        } finally {
            setIsEpisodeLoading(false);
        }
    }
    useEffect(() => {
        if (episodes !== null && currentEpisode !== null) {
            setFlixDataModel(episodes[currentEpisode]);
        } else {
            setFlixDataModel(null);
        }
    }, [currentEpisode, episodes])

    const handleEpisodeClick = async (index: number) => {
        setIsEpisodePlaying(true);
        if (!episodes && seriesData) {
            await fetchSeasonFlix(seriesData.seasons[currentSeason].id);
        }
        setCurrentEpisode(index);
    }

    const handleRecommendedClick = (video: PostlistItem) => {
        setIsEpisodePlaying(true);
        setFlixDataModel(video);
    }

    const handlePlayLatest = () => {
        if (seasonData) {
            handleEpisodeClick(seasonData.episodes.length - 1);
        }
    }
    const getRecommendedVideos = () => {
        if (!isRecommendedLoading && recommendedVideos.length === 0) {
            (async () => {
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
                        setRecommendedVideos(response.data);
                    } else {
                        console.error("API returned unsuccessful response");
                    }
                } catch (error) {
                    console.error("Failed to fetch recommended videos:", error);
                } finally {
                    setIsRecommendedLoading(false);
                }
            })();
        }

        if (isRecommendedLoading) {
            return <RecommendedVideosSkeleton count={5} />;
        }

        if (recommendedVideos.length === 0) {
            return <p className="text-gray-400">No recommendations available</p>;
        }

        return (
            <div>
                {recommendedVideos.map((video) => (
                    <div
                        key={video.postId}
                        className="flex gap-4 rounded-md hover:bg-primary-bg-color p-2 mb-4 cursor-pointer"
                        onClick={() => handleRecommendedClick(video)}
                    >
                        <div className="relative w-1/3 rounded-md overflow-hidden flex-shrink-0">
                            <SafeImage
                                src={video.coverFile}
                                alt={video.postTitle}
                                videoUrl={video.videoFile[0]}
                                width={120}
                                height={80}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <div className="w-2/3 min-w-0">
                            <h3 className="text-lg font-semibold truncate">{video.postTitle}</h3>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            {seriesData ? (
                <div className='min-h-screen w-full'>
                    <div className="flex flex-col lg:flex-row">
                        {!isEpisodePlaying ?
                            (<div className="lg:w-3/4 h-screen overflow-y-auto">

                                {/* Cover Image */}
                                <div className="relative h-[30vh] md:h-[70vh] w-full text-text-color">
                                    <div className="absolute inset-0">
                                    <SafeImage
                                        src={seriesData.coverfile}
                                        alt={seriesData.series_name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-bg-color-70 to-transparent" />
                                    </div>

                                    <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-12 max-w-3xl">
                                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{seriesData.series_name}</h1>
                                        <p className="text-lg md:text-xl mb-6">{seriesData.description}</p>
                                        <div className="flex items-center gap-4">
                                            <Button isLinearBorder={true} isLinearBtn={true} onCLick={handlePlayLatest}>
                                                <FaPlay />
                                                <p className="font-semibold">Play Latest</p>
                                            </Button>
                                            <div className="relative text-text-color">
                                                <Button isLinearBorder={true} onClick={toggleSeasonDropdown}>
                                                    <p className="font-semibold">Season {currentSeason + 1}</p>
                                                    <IoChevronDownSharp />
                                                </Button>

                                                {isSeasonDropdown &&
                                                    <div className="absolute -bottom-[3rem] left-0 w-full bg-primary-bg-color shadow-sm rounded-md">
                                                        {seasonList?.map((_, index) => (
                                                            <div key={index + 1} className="hover:bg-bg-color-70 cursor-pointer w-full p-2" onClick={() => { setCurrentSeason(index); toggleSeasonDropdown() }}>
                                                                <p>Season {index + 1}</p>
                                                            </div>
                                                        ))}
                                                    </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Season Info */}
                                {seasonData ? (
                                    isLoading ?
                                        (<div className="w-full">
                                            <SeasonInfoSkeleton />
                                        </div>)
                                        :
                                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:px-5">
                                            <h2 className="text-3xl font-bold md:hidden">{seasonData.season.title}</h2>
                                            <div className="relative w-full md:w-1/3 aspect-[5/3] rounded-lg overflow-hidden">
                                            <SafeImage
                                                src={seasonData.season.poster_image}
                                                alt={seasonData.season.title}
                                                className="w-full h-full object-cover"
                                            />
                                            </div>
                                            <div className="md:w-2/3">
                                                <h2 className="text-3xl font-bold mb-4 max-md:hidden">{seasonData.season.title}</h2>
                                                <p className="text-lg mb-6">{seasonData.season.description}</p>
                                            </div>
                                        </div>)
                                    : (
                                        <div>
                                            No season found
                                        </div>
                                    )}

                            </div>)
                            : (
                                isEpisodeLoading ?
                                    (<EpisodeLoadingSkeleton />)
                                    : (flixDatamodel &&
                                        <div className="lg:w-3/4 max-h-screen overflow-y-auto">
                                            <FlixVideoModal flix={flixDatamodel} setSingleFlixDataModel={setFlixDataModel}
                                                setShowMobileComments={setShowMobileComments}
                                                showMobileComments={showMobileComments}
                                            />
                                        </div>
                                    )
                            )}

                        {/* Sidebar episodes*/}
                        <div className="w-full lg:w-1/4 p-4 h-screen sticky top-0 overflow-y-auto">
                            {seasonData ? (
                                <div>
                                    <div className='flex justify-between items-center mb-4'>
                                        <div className="flex items-center gap-1">
                                            {isEpisodePlaying && <FaChevronLeft onClick={() => setIsEpisodePlaying(false)} size={20} />}
                                            <h2 className="text-2xl font-bold">Episodes</h2>
                                        </div>
                                        <p>{seasonData.episodes.length} Episodes</p>
                                    </div>

                                    {seasonData.episodes.map((episode, index) => (
                                        <div key={index} className="flex gap-4 rounded-md hover:bg-primary-bg-color p-2 mb-4" onClick={() => handleEpisodeClick(index)}>
                                            <div className="relative w-1/3 rounded-md overflow-hidden flex-shrink-0">
                                            <SafeImage
                                                src={episode.thumbnail}
                                                alt={episode.title}
                                                className="w-full h-full object-cover"
                                            />
                                            </div>
                                            <div className="w-2/3 min-w-0">  {/* Added min-w-0 to handle text overflow */}
                                                <h3 className="text-xl font-semibold truncate">{episode.title}</h3>
                                                <p className="text-sm line-clamp-2">{episode.description}</p>
                                            </div>
                                            {episode.duration !== "0" &&
                                                <div className='text-primary-text-color text-sm'>
                                                    {formatVideoRuntime(Number(episode.duration))}
                                                </div>
                                            }
                                        </div>
                                    ))}

                                    {/* Recommended Videos Section */}
                                    <div className="mt-8 border-t border-gray-700 pt-4">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-200">Recommended For You</h2>
                                        {getRecommendedVideos()}
                                    </div>
                                </div>
                            )
                                : (
                                    <div>
                                        No episode found
                                    </div>
                                )}
                        </div>

                    </div>
                </div>) : (
                <div>
                    <p>Error</p>
                </div>
            )}
            {showMobileComments && flixDatamodel && (
                <div className="absolute bottom-0 left-0 w-full max-h-[67vh] z-50">
                    <CommentsSection
                        flixId={flixDatamodel.postId}
                        postOwner={flixDatamodel.userFullName || flixDatamodel.userName}
                        closeModal={() => setShowMobileComments(false)}
                        width="w-full"
                        height="h-[67vh]"
                        commentsHeight='max-h-[330px]'
                        isLoggedInPostOwner={flixDatamodel.userId === parseInt(storedUserId)}
                    />
                </div>
            )}
        </>
    )
}

export default SeriesPage