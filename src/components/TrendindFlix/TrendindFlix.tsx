"use client";
import Avatar from "@/components/Avatar/Avatar";
import {
    VideoGridSkeleton,
    HorizontalSeriesSkeleton,
    HorizontalPlaylistSkeleton,
    HorizontalWatchHistorySkeleton
} from "@/components/Skeletons/Skeletons";
import MoreOptions from '@/components/MoreOptions';
import PlaylistDetailOverlay from '@/components/Playlist/playlist';
import ReportModal from "@/components/modal/ReportModal";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaEllipsisVertical } from "react-icons/fa6";
// Remove ShowMoreButton import since we're not using it anymore
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import { PostlistItem, PostlistResponse } from "@/models/postlistResponse";
import { getFlixList } from "@/services/auth/flixlist";
import { flixSearch, SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import { fetchMiniWatchHistory, WatchHistoryItem } from "@/services/getminiwatchhistory";
import { getPlaylistsList, Playlist } from "@/services/getplaylistslist";
import { getSeriesList, Series } from "@/services/getserieslist";
import { snipSearch } from "@/services/snipsearch";
import { timeAgo } from "@/utils/features";
import useUserRedirection from "@/utils/userRedirection";
import { useRouter } from "next/navigation";
import SearchComponent from "../SearchComponent/SearchComponent";
import SeriesDetails from "../flix/SeriesDetails";

import useLocalStorage from "@/hooks/useLocalStorage";
import { getPostListNew } from "@/services/auth/getpostlist";
import React from "react";
import SafeImage from "../shared/SafeImage";


export default function TrendingFlix() {
    const [posts, setPosts] = useState<PostlistItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); // Track if more data is available

    const redirectUser = useUserRedirection();
    const { setInAppFlixData, clearFlixData } = useInAppRedirection();
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<FlixSearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMoreLoading, setShowMoreLoading] = useState(false);
    const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null);
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [isSeriesLoading, setisSeriesLoading] = useState<boolean>(false)
    const [openSeries, setOpenSeries] = useState<number | null>(null);
    const isFetchingRef = useRef(false);
    const [playlistsLoading, setPlaylistsLoading] = useState<boolean>(false);
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([])
    const [openPlaylist, setOpenPlaylist] = useState<number | null>(null);
    const [searchResultsSnips, setSearchResultsSnips] = useState<PostlistResponse["data"]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"users" | "videos" | "snips">("videos");
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchPage, setSearchPage] = useState(1);
    const RESULTS_PER_PAGE = 6;
    const searchPageRef = useRef(1);
    const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
    const [isWatchHistoryLoading, setIsWatchHistoryLoading] = useState<boolean>(false);
    const [isSnipsModalOpen, setIsSnipsModalOpen] = useState(false);
    const [selectedSnip, setSelectedSnip] = useState<PostlistResponse["data"][number] | null>(null);
    const [snipsList, setSnipsList] = useState<PostlistResponse["data"]>([]);
    const [horizontalPosts, setHorizontalPosts] = useState<PostlistItem[]>([]);
    const [horizontalLoading, setHorizontalLoading] = useState(false);
    const [horizontalError, setHorizontalError] = useState<string | null>(null);
    const [showHorizontalOnPage, setShowHorizontalOnPage] = useState<number[]>([]);
    const {
        setInAppSnipsData,
        setSnipIndex,
    } = useInAppRedirection();
    // Infinite scroll observer ref
    const infiniteScrollRef = useRef<HTMLDivElement>(null);
    const infiniteScrollObserverRef = useRef<IntersectionObserver>();

    const closeSnipsModal = () => {
        setIsSnipsModalOpen(false);
        setSelectedSnip(null);
        setSnipsList([]);
    };

    const setSearchPageAndRef = (page: number) => {
        setSearchPage(page);
        searchPageRef.current = page;
    };

    const handleSnipClick = (post: any, index: number) => {
        if (!post) return;
        setInAppSnipsData(horizontalPosts);
        setSnipIndex(index);
        router.push('/home/snips');
    };
    const observerRef = useRef<IntersectionObserver>();
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const pageRef = useRef(1);
    const fetchPosts = useCallback(
        async (isShowMore: boolean = false) => {
            if (isFetchingRef.current || !hasMore) return;

            if (isShowMore) {
                setShowMoreLoading(true);
            } else {
                setLoading(true);
            }

            isFetchingRef.current = true;

            const limit = 8;
            const offset = posts.length;

            const requestData = {
                isForYou: "1",
                limit: limit,
                offset: offset,
                isFromFeedTab: true,
                isLogin: 1,
                isForInteractiveVideo: "1",
            };

            try {
                const response = await getFlixList(requestData);
                if (response.isSuccess && response.data) {
                    // Check if we got fewer items than requested, indicating no more data
                    if (response.data.length < limit) {
                        setHasMore(false);
                    }

                    setPosts((prevPosts) => [...prevPosts, ...response.data]);
                    const newPage = page + 1;
                    setPage(newPage);

                    // Call horizontal posts on alternate pages (2, 4, 6, 8...)
                    if (newPage % 4 === 0) {
                        fetchHorizontalPosts();
                        setShowHorizontalOnPage(prev => [...prev, newPage]);
                    }
                } else {
                    setError(response.message || "Failed to load posts");
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Failed to fetch post list:", error);
                setError("Failed to fetch post list");
                setHasMore(false);
            } finally {
                if (isShowMore) {
                    setShowMoreLoading(false);
                } else {
                    setLoading(false);
                }
                isFetchingRef.current = false;
            }
        },
        [posts.length, hasMore, page]
    );
    const [userId] = useLocalStorage<string>("userId", "");
    const fetchHorizontalPosts = useCallback(async () => {
        setHorizontalLoading(true);
        const requestData = {

            isForYou: "1",
            isForAll: "1",
            limit: 10,
            page: pageRef.current,
            isFromFeedTab: false,
            isLogin: userId ? 1 : 0,
            isForInteractiveVideo: "1",
            isForRandom: true

        };
        try {
            const response = await getPostListNew(requestData);
            if (response.isSuccess && response.data) {
                setHorizontalPosts(response.data); // Replace instead of append
            } else {
                setHorizontalError(response.message || "Failed to load posts");
            }
        } catch (error) {
            console.error("Failed to fetch horizontal post list:", error);
            setHorizontalError("Failed to fetch horizontal post list");
        } finally {
            setHorizontalLoading(false);
        }
    }, [userId]);

    // Infinite scroll effect
    useEffect(() => {
        const currentInfiniteScrollRef = infiniteScrollRef.current;

        if (!currentInfiniteScrollRef || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && !isFetchingRef.current && hasMore) {
                    fetchPosts(true);
                }
            },
            {
                root: null,
                rootMargin: '100px', // Start loading 100px before reaching the bottom
                threshold: 0.1,
            }
        );

        observer.observe(currentInfiniteScrollRef);
        infiniteScrollObserverRef.current = observer;

        return () => {
            if (infiniteScrollObserverRef.current) {
                infiniteScrollObserverRef.current.disconnect();
            }
        };
    }, [fetchPosts, hasMore]);

    const getMiniWatchHistory = async () => {
        setIsWatchHistoryLoading(true);
        try {
            const response = await fetchMiniWatchHistory();
            if (response.isSuccess && response.data.history && response.data.history.length > 0) {
                setWatchHistory(response.data.history);
            }
        } catch (error) {
        } finally {
            setIsWatchHistoryLoading(false);
        }
    };

    const formatWatchDate = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const fetchSeries = async () => {
        setisSeriesLoading(true);
        try {
            const response = await getSeriesList({ page: 1, limit: 10 });
            if (response.isSuccess && response.data) {
                setSeriesList(response.data.series);
            } else {
                console.error("Failed to fetch series list");
            }
        } catch (error) {
            console.error("Failed to fetch series list:", error);
            setError("Failed to fetch series list");
        } finally {
            setisSeriesLoading(false);
        }
    }

    const fetchUserPlaylists = async () => {
        setPlaylistsLoading(true);
        try {
            const response = await getPlaylistsList({ page: 1, limit: 10 });
            if (response.isSuccess && response.data) {
                setUserPlaylists(response.data);
            } else {
                console.error("Failed to fetch playlists list");
            }
        } catch (error) {
            console.error("Failed to fetch user playlists:", error);
        } finally {
            setPlaylistsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserPlaylists();
        getMiniWatchHistory();
    }, []);

    const updatePost = (id: number, property: string, isBeforeUpdate: number) => {
        if (property === 'like') {
            isBeforeUpdate ? setPosts(prev => prev.map(post => post.postId === id ? { ...post, isLiked: 0, likeCount: post.likeCount - 1 } : post)) : setPosts(prev => prev.map(post => post.postId === id ? { ...post, isLiked: 1, likeCount: post.likeCount + 1 } : post))
        } else if (property === 'save') {
            isBeforeUpdate ? setPosts(prev => prev.map(post => post.postId === id ? { ...post, isSaved: 0, saveCount: post.saveCount - 1 } : post)) : setPosts(prev => prev.map(post => post.postId === id ? { ...post, isSaved: 1, saveCount: post.saveCount + 1 } : post))
        } else if (property === 'delete') {
            setPosts((prev) => prev.filter(post => post.postId !== id));
        } else if (property === 'block' || property === 'hide') {
            setPosts((prev) => prev.filter(post => post.userId !== id));
        }
    }

    const redirectToFlix = (flixData: PostlistItem | FlixSearchResultItem) => {
        clearFlixData();
        const formattedData = 'id' in flixData ? {
            postId: flixData.id,
            postTitle: flixData.title,
            userFullName: flixData.username,
            coverFile: flixData.coverFile,
            userProfileImage: flixData.userProfileImage,
            userId: flixData.userid,
            viewCounts: 0,
            scheduleTime: new Date().toISOString(),
            isLiked: 0,
            likeCount: 0,
            isSaved: 0,
            saveCount: 0,
        } : flixData;

        setInAppFlixData(formattedData);
        const postId = 'id' in flixData ? flixData.id : flixData.postId;
        router.push(`/home/flix/${postId}`);
    }

    const handleResultClick = (result: FlixSearchResultItem) => {
        if (result.type === 'post') {
            clearFlixData();
            const formattedData = {
                id: result.id,
                title: result.title,
                userFullName: result.userFullName || result.username,
                coverFile: result.coverFile,
                userProfileImage: result.userProfileImage,
                userid: result.userid,
                viewCounts: 0,
                scheduleTime: new Date().toISOString(),
                isLiked: 0,
                likeCount: 0,
                isSaved: 0,
                saveCount: 0,
            };
            setInAppFlixData(formattedData);
            router.push(`/home/flix/${result.id}`);
        } else {
            redirectUser(result.userid, `/home/users/${result.userid}`);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchHorizontalPosts(); // Add this line
    }, []);

    const handleSnipResultClick = (result: PostlistResponse["data"][number]) => {
        setSelectedSnip(result);
        setSnipsList(searchResultsSnips);
        setIsSnipsModalOpen(true);
    };

    const handleSearch = useCallback(async (query: string, tab: "users" | "videos" | "snips", pageNumber?: number) => {
        const currentPage = pageNumber || 1;

        setSearchTerm(query);
        setIsDropdownOpen(true);
        setActiveTab(tab);

        if (pageNumber === 1) {
            setSearchResults([]);
        }

        if (!query?.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            setSearchPageAndRef(1);
            return;
        }

        setIsSearching(true);
        try {
            let response;
            let responseSnips;

            const limit = 8;
            const offset = (currentPage - 1) * limit;

            if (tab === "users" || tab === "videos") {
                response = await flixSearch({
                    query: query.trim(),
                    page: currentPage,
                    limit: RESULTS_PER_PAGE,
                    searchUsers: tab === "users",
                });
            } else if (tab === "snips") {
                responseSnips = await snipSearch({
                    query: query.trim(),
                    offset: offset,
                });
            }
            if (response?.isSuccess && response.data) {
                setSearchResults(prev =>
                    currentPage === 1
                        ? response!.data
                        : [...prev, ...response!.data]
                );

                if (response.data.length > 0) {
                    setSearchPageAndRef(currentPage + 1);
                }
            }

            if (responseSnips?.isSuccess && responseSnips.data) {
                setSearchResultsSnips(prev =>
                    currentPage === 1
                        ? responseSnips!.data
                        : [...prev, ...responseSnips!.data]
                );

                if (responseSnips.data.length > 0) {
                    setSearchPageAndRef(currentPage + 1);
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        if (!searchTerm || isSearching) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleSearch(searchTerm, activeTab, searchPageRef.current);
                }
            },
            { threshold: 0.1 }
        );

        const currentLoadMoreRef = loadMoreRef.current;
        if (currentLoadMoreRef) {
            observer.observe(currentLoadMoreRef);
        }

        return () => {
            if (currentLoadMoreRef) {
                observer.disconnect();
            }
        };
    }, [searchTerm, isSearching, searchPage, handleSearch]);

    const loadMoreResults = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!searchTerm) {
            console.error("Error: searchTerm is empty or undefined", { searchTerm });
            return;
        }
        setIsSearching(true);

        try {
            let response: any;
            let responseSnips;

            const limit = 12;
            const offset = (searchPageRef.current - 1) * limit;

            if (activeTab === "users") {
                response = await flixSearch({
                    query: searchTerm,
                    page: searchPageRef.current,
                    limit: RESULTS_PER_PAGE,
                    searchUsers: activeTab === "users",
                });
            } else if (activeTab === "videos") {
                response = await flixSearch({
                    query: searchTerm,
                    page: searchPageRef.current,
                    limit: RESULTS_PER_PAGE,
                });
            }
            if (response?.isSuccess && response.data) {
                if (response.data.length > 0) {
                    setSearchResults(prevResults => {
                        return [...prevResults, ...response.data];
                    });

                    const nextPage = searchPageRef.current + 1;
                    setSearchPageAndRef(nextPage);
                }
            } else {
                console.error('API returned unsuccessful response:', response);
            }

        } catch (error) {
            console.error('Error fetching more search results:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const loadMoreResultsForSnips = async () => {
        if (!searchTerm) {
            console.error("Error: searchTerm is empty or undefined", { searchTerm });
            return;
        }
        setIsSearching(true);

        try {
            const limit = 12;
            const offset = (searchPageRef.current - 1) * limit;

            const responseSnips = await snipSearch({
                query: searchTerm,
                limit: limit,
                offset: offset,
            });
            if (responseSnips?.isSuccess && responseSnips.data) {
                if (responseSnips.data.length > 0) {
                    setSearchResultsSnips((prevResults) => {
                        return [...prevResults, ...responseSnips.data];
                    });

                    const nextPage = searchPageRef.current + 1;
                    setSearchPageAndRef(nextPage);
                }
            } else {
                console.error("API returned unsuccessful response for snips:", responseSnips);
            }
        } catch (error) {
            console.error("Error fetching more snips results:", error);
        } finally {
            setIsSearching(false);
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className="flex flex-col justify-center max-md:pb-20">
                <p className="text-xl font-bold my-2 p-3 md:pl-4 pt-4">Minis For You</p>
                <VideoGridSkeleton count={8} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center max-md:pb-20">
            <div>
                {seriesList.length > 0 && (
                    <>
                        <p className="text-xl font-bold mt-8 mb-4 p-3 md:pl-4">BigShorts Originals</p>
                        <div className="flex gap-8 w-full overflow-x-auto mb-8 p-3 md:pl-4">
                            {isSeriesLoading ? (
                                <HorizontalSeriesSkeleton count={4} />
                            ) : (
                                seriesList.map((series, index) => (
                                    <div
                                        key={index}
                                        className="cursor-pointer shadow-md shadow-shadow-color rounded-md shrink-0 relative border border-border-color"
                                        style={{ width: 'calc(100% / 4 - 18px)', minWidth: '280px' }}
                                        onClick={() => setOpenSeries(series.id)}
                                    >
                                        <div className="relative">
                                            <SafeImage
                                                src={series.coverfile}
                                                alt={series.series_name}
                                                style={{ aspectRatio: "16/9" }}
                                                className="w-full h-40 object-cover rounded-t-md"
                                                height={500}
                                                width={500}
                                            />
                                            <div className="absolute top-0 right-0 p-1">
                                                <div className="bg-bg-color bg-opacity-50 text-primary-text-color rounded-md p-1">
                                                    <p className="text-xs font-semibold">{series.seasons.length} Seasons</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 text-text-color">
                                            <div className="flex gap-2">
                                                <div className="w-8 h-8 rounded-full bg-secondary-bg-color flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold">BS</span>
                                                </div>
                                                <div className="flex justify-between w-[calc(100%-40px)] items-start relative">
                                                    <div className="flex flex-col w-[calc(100%-24px)]">
                                                        <h2 className="text-sm font-semibold mb-2 truncate break-words">
                                                            {series.series_name}
                                                        </h2>
                                                        <div className="flex justify-between w-full">
                                                            <p className="text-xs truncate max-w-[120px]">BigShorts Original</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenSeries(series.id);
                                                        }}
                                                        className="w-6 flex-shrink-0 relative"
                                                    >
                                                        <FaEllipsisVertical className="text-text-color" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {openSeries === series.id && <SeriesDetails onClose={() => setOpenSeries(null)} series={series} isFromProfile={false} />}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                <p className="text-xl font-bold my-2 p-3 md:pl-4 pt-4">Mini Drama Series</p>
                <div className="flex gap-8 w-full overflow-x-auto mb-2 p-3 md:pl-4">
                    {playlistsLoading ? (
                        <HorizontalPlaylistSkeleton count={4} />
                    ) : (
                        userPlaylists.map((playlist, index) => (
                            <div
                                key={index}
                                className="cursor-pointer shadow-md shadow-shadow-color rounded-md shrink-0 border border-border-color ransition-transform duration-200 hover:scale-[1.015]"
                                style={{ width: 'calc(100% / 4 - 18px)', minWidth: '280px' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenPlaylist(playlist.id);
                                }}
                            >
                                <SafeImage
                                    src={playlist.coverfile}
                                    alt={playlist.playlist_name}
                                    style={{ aspectRatio: "16/9" }}
                                    className="w-full object-cover rounded-t-md"
                                    height={500}
                                    width={500}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenPlaylist(playlist.id);
                                    }}
                                />
                                <div className="p-2 text-text-color">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                redirectUser(playlist.userData.id, `/home/users/${playlist.userData.id}`)
                                            }}
                                            className="w-max"
                                        >
                                            <Avatar src={playlist.userData.profileImage} name={playlist.userData.name} />
                                        </button>
                                        <div className="flex justify-between w-[calc(100%-40px)] items-start relative">
                                            <div className="flex flex-col w-[calc(100%-24px)]">
                                                <h2 className="text-sm font-semibold mb-2 truncate break-words">
                                                    {playlist.playlist_name}
                                                </h2>
                                                <div className="flex justify-between w-full">
                                                    <p className="text-xs truncate max-w-[120px]">{playlist.userData.name ? playlist.userData.name : playlist.userData.username}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {openPlaylist === playlist.id && (
                                    <PlaylistDetailOverlay
                                        isFromProfile={false}
                                        playlist={playlist}
                                        onClose={() => setOpenPlaylist(null)}
                                    />
                                )}
                            </div>
                        ))
                    )}
                    {!playlistsLoading && userPlaylists.length === 0 && (
                        <div className="w-full text-center py-4">
                            <p className="text-gray-500">No playlists found</p>
                        </div>
                    )}
                </div>

                {watchHistory.length > 0 && (
                    <>
                        <p className="text-xl font-bold my-2 p-3 md:pl-4 pt-4">Continue Watching</p>
                        <div className="flex gap-8 w-full overflow-x-auto mb-2 p-3 md:pl-4">
                            {isWatchHistoryLoading ? (
                                <HorizontalWatchHistorySkeleton count={4} />
                            ) : watchHistory.length > 0 && (
                                watchHistory.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => redirectToFlix({
                                            id: item.flix_id,
                                            title: item.title || "Untitled Video",
                                            username: item.userName,
                                            coverFile: item.coverFile,
                                            userProfileImage: "",
                                            userid: 0,
                                            type: "post"
                                        })}
                                        className="cursor-pointer transition-transform duration-200 hover:scale-[1.015] shadow-md shadow-shadow-color rounded-md shrink-0 border border-border-color overflow-hidden"
                                        style={{ width: 'calc(100% / 4 - 18px)', minWidth: '280px' }}
                                    >
                                        <div className="relative">
                                            <SafeImage
                                                src={item.coverFile}
                                                alt={item.title || "Video"}
                                                style={{ aspectRatio: "16/9" }}
                                                className="w-full rounded-t-md"
                                                height={500}
                                                width={500}
                                            />

                                            <div className="absolute text-white bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent z-10 px-3 py-2 text-primary-text-color text-xs flex flex-col justify-end">
                                                <div className="flex justify-between items-start w-full">
                                                    <h2 className="text-sm font-semibold truncate max-w-[80%] text-white">
                                                        {item.title || "Untitled Video"}
                                                    </h2>
                                                </div>

                                                <div className="flex justify-between mt-1 text-xs opacity-80 text-white">
                                                    <p className="truncate max-w-[140px]">{item.userName}</p>
                                                    <p className="whitespace-nowrap">{formatWatchDate(item.last_watched)}</p>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary-bg-color bg-opacity-60 z-20">
                                                <div
                                                    className={`h-full ${parseFloat(item.watch_percentage) > 90 ? 'bg-green-600' : 'bg-red-600'}`}
                                                    style={{ width: `${parseFloat(item.watch_percentage)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                <p className="text-xl font-bold my-2 p-3 md:pl-4 pt-4">Minis For You</p>
                <div className="w-full p-4">
                    {/* Regular grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full mb-8">
                        {posts.map((video, index) => {
                            const currentPageForPost = Math.floor(index / 8) + 1;
                            const shouldShowHorizontalAfter = showHorizontalOnPage.includes(currentPageForPost) &&
                                (index + 1) % 8 === 0; // Show after every 8th post of that page

                            return (
                                <React.Fragment key={index + 1}>
                                    <div className="cursor-pointer shadow-md shadow-shadow-color rounded-md w-full border border-border-color ransition-transform duration-200 hover:scale-[1.015]"
                                    >
                                        <SafeImage
                                            onClick={() => redirectToFlix(video)}
                                            src={video.coverFile}
                                            videoUrl={video.videoFile[0]}
                                            alt={video.postTitle}
                                            style={{ aspectRatio: "16/9" }}
                                            className="w-full object-cover rounded-t-md"
                                            height={500}
                                            width={500}
                                        />
                                        <div className="p-2 text-text-color">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        redirectUser(video.userId, `/home/users/${video.userId}`)
                                                    }}
                                                    className="w-max"
                                                >
                                                    <Avatar src={video.userProfileImage} name={video.userFullName} />
                                                </button>
                                                <div className="flex justify-between w-[calc(100%-40px)] items-start relative">
                                                    <div className="flex flex-col w-[calc(100%-24px)]">
                                                        <h2 className="text-sm font-semibold mb-2 truncate break-words">
                                                            {video.postTitle}
                                                        </h2>
                                                        <div className="flex justify-between w-full">
                                                            <p className="text-xs truncate max-w-[120px]">{video.userFullName}</p>
                                                            <p className="text-xs whitespace-nowrap">
                                                                {video.viewCounts} Views · {timeAgo(video.scheduleTime)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setOpenMoreOptions(video.postId)}
                                                        className="w-6 flex-shrink-0 relative"
                                                    >
                                                        <FaEllipsisVertical className="text-text-color" />
                                                        {openMoreOptions === video.postId && <MoreOptions post={video} setIsOpen={setOpenMoreOptions} updatePost={updatePost} page='flix' />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Show horizontal list after completing posts from alternate pages */}
                                    {shouldShowHorizontalAfter && horizontalPosts.length > 0 && (
                                        <div className="col-span-full mb-6">
                                            <p className="text-lg font-semibold mb-4 px-3">Snips</p>
                                            <div className="flex gap-3 w-full overflow-x-auto px-3">
                                                {horizontalPosts.map((horizontalVideo, hIndex) => (
                                                    <div
                                                        key={`horizontal-${currentPageForPost}-${hIndex}`}
                                                        className="cursor-pointer shadow-md shadow-shadow-color rounded-md shrink-0 border border-border-color relative overflow-hidden"
                                                        style={{ width: '180px', minWidth: '180px' }}
                                                        onClick={() => handleSnipClick(horizontalVideo, hIndex)}
                                                    >
                                                        <img
                                                            src={horizontalVideo.coverFile}
                                                            alt={horizontalVideo.postTitle}
                                                            className="w-full object-cover rounded-md"
                                                            style={{ height: '320px', aspectRatio: "9/16" }}
                                                            height={500}
                                                            width={500}
                                                        />

                                                        {/* Overlay content at bottom of image */}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                                                            <div className="flex flex-col gap-2">

                                                                {/* <h2 className="text-sm font-semibold line-clamp-2 break-words text-white">
                                                    {horizontalVideo.postTitle}
                                                </h2> */}

                                                                {/* User info and more options */}
                                                                <div className="flex gap-2 items-center justify-between">
                                                                    <div className="flex gap-2 items-center flex-1 min-w-0">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                redirectUser(horizontalVideo.userId, `/home/users/${horizontalVideo.userId}`)
                                                                            }}
                                                                            className="w-max flex-shrink-0"
                                                                        >
                                                                            <Avatar src={horizontalVideo.userProfileImage} />
                                                                        </button>
                                                                        <p className="text-xs truncate text-gray-200 flex-1">@{horizontalVideo.userFullName == "" ? horizontalVideo.userName : horizontalVideo.userFullName}</p>
                                                                    </div>
                                                                    {/* <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMoreOptions(horizontalVideo.postId);
                                                        }}
                                                        className="w-6 flex-shrink-0"
                                                    >
                                                        <FaEllipsisVertical className="text-white" />
                                                        {openMoreOptions === horizontalVideo.postId && <MoreOptions post={horizontalVideo} setIsOpen={setOpenMoreOptions} openReport={setOpenReportModal} updatePost={updatePost} page='flix' />}
                                                    </button> */}
                                                                </div>

                                                                {/* Views and time */}
                                                                <p className="text-xs text-gray-300">
                                                                    {timeAgo(horizontalVideo.scheduleTime)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Infinite Scroll Trigger - Replace the ShowMoreButton */}
                {hasMore && (
                    <div
                        ref={infiniteScrollRef}
                        className="flex justify-center py-8"
                    >
                        {showMoreLoading && <VideoGridSkeleton count={4} />}

                    </div>
                )}

                {!hasMore && posts.length > 0 && (
                    <div className="flex justify-center py-8">
                        <p className="text-gray-500 text-sm">You&apos;ve reached the end of the content</p>
                    </div>
                )}
            </div>
        </div >
    );
}