'use client';
import SearchBar from "@/components/searchFlix/searchBar";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import { PostlistItem, PostlistResponse } from "@/models/postlistResponse";
import { flixSearch, SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import { getPostDetails } from "@/services/getpostdetails";
import { snipSearch } from "@/services/snipsearch";
import useUserRedirection from "@/utils/userRedirection";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import SearchMinis from "./SearchMinis";
import SearchSnips from "./SearchSnips";
import SearchUsers from "./SearchUsers";

const RESULTS_PER_PAGE = 8;

interface SearchComponentProps {
  dropdownStyle: "style1" | "style2";
  toggleSearch?: () => void;
  toggleSidebar?: () => void; // Optional, if you want to toggle sidebar
}

const SearchComponent = ({ dropdownStyle = "style1", toggleSearch, toggleSidebar }: SearchComponentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<FlixSearchResultItem[]>([]);
  const [searchResultsSnips, setSearchResultsSnips] = useState<PostlistItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "videos" | "snips">("videos");
  const [searchPage, setSearchPage] = useState(1);
  const { setInAppSnipsData, setSnipId, setSnipIndex, } = useInAppRedirection()
  const [selectedSnip, setSelectedSnip] = useState<PostlistItem | null>(null);
  const [isSnipsModalOpen, setIsSnipsModalOpen] = useState(false);
  const { setInAppFlixData, clearFlixData } = useInAppRedirection();

  const redirectUser = useUserRedirection();
  const router = useRouter();
  const searchPageRef = useRef(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const setSearchPageAndRef = (page: number) => {
    setSearchPage(page);
    searchPageRef.current = page;
  };

  const redirectToFlix = (flixData: PostlistItem | FlixSearchResultItem) => {
    clearFlixData();
    // Convert SearchResultItem to PostlistItem
    const formattedData = 'id' in flixData ? {
      postId: flixData.id, // This is the source of the issue
      postTitle: flixData.title,
      userFullName: flixData.username,
      coverFile: flixData.coverFile,
      userProfileImage: flixData.userProfileImage,
      userId: flixData.userid,
      // Add other required PostlistItem fields with defaults
      viewCounts: 0,
      scheduleTime: new Date().toISOString(),
      isLiked: 0,
      likeCount: 0,
      isSaved: 0,
      saveCount: 0,
    } : flixData;

    setInAppFlixData(formattedData);
    // Use the correct postId for navigation
    const postId = 'id' in flixData ? flixData.id : flixData.postId;
    router.push(`/home/flix/${postId}`);
  }

  const closeSnipsModal = () => {
    setIsSnipsModalOpen(false); // Close the modal
    //setSelectedSnip(null); // Reset the selected Snip
    //setSearchResultsSnips([]); // Clear the Snips results
  };

  type RecentSearch =
    | {
      type: "user";
      userId: number;
      userProfileImage: string;
      username: string;
    }
    | {
      type: "mini";
      id: number;
      title: string;
      coverFile: string;
      username: string;
    }
    | {
      type: "snip";
      postId: number;
      postTitle: string;
      coverFile: string;
      username: string;
    };

  // Add a search to recent history
  const addToRecentHistory = (entry: RecentSearch) => {
    const identifier =
      entry.type === "user"
        ? `user-${entry.userId}`
        : entry.type === "mini"
          ? `mini-${entry.id}`
          : `snip-${entry.postId}`;

    const updated = [
      entry,
      ...recentSearches.filter((item) => {
        const existingId =
          item.type === "user"
            ? `user-${item.userId}`
            : item.type === "mini"
              ? `mini-${item.id}`
              : `snip-${item.postId}`;
        return existingId !== identifier;
      }),
    ];

    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Load recent history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        const parsed: RecentSearch[] = JSON.parse(stored);
        setRecentSearches(parsed);
      } catch (e) {
        console.error("Invalid recentSearches format", e);
      }
    }
  }, []);

  const recentSearchUsers = recentSearches.filter(item => item.type === "user") as Extract<RecentSearch, { type: "user" }>[];
  const recentSearchMinis = recentSearches.filter(item => item.type === "mini") as Extract<RecentSearch, { type: "mini" }>[];
  const recentSearchSnips = recentSearches.filter(item => item.type === "snip") as Extract<RecentSearch, { type: "snip" }>[];


  const removeSearch = (indexToRemove: number): void => {
    const updated = [...recentSearches];
    updated.splice(indexToRemove, 1);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Clear recent history
  const clearHistory = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  const dropdownVisibility = (value: boolean) => {
    setShowDropdown(value);
  };

  const handleResultClick = (result: FlixSearchResultItem) => {
    if (toggleSearch) {
      toggleSearch();
    }
    if (toggleSidebar) {
      toggleSidebar();
    }
    if (result.type === 'post') {
      clearFlixData();
      const formattedData = {
        id: result.id,
        title: result.title,
        userFullName: result.userFullName || result.username, // Use userFullName if available, fallback to username
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
      addToRecentHistory({
        type: "mini",
        id: result.id,
        title: result.title,
        coverFile: result.coverFile,
        username: result.username,
      });
      setInAppFlixData(formattedData);
      router.push(`/home/flix/${result.id}`);
    } else {
      addToRecentHistory({
        type: "user",
        userId: result.userid,
        userProfileImage: result.userProfileImage,
        username: result.username,
      });
      redirectUser(result.userid, `/home/users/${result.userid}`);
    }
  };

  const handleSnipResultClick = (result: PostlistItem) => {

    addToRecentHistory({
      type: "snip",
      postId: result.postId,
      postTitle: result.postTitle,
      coverFile: result.coverFile,
      username: result.userName,
    });
    if (toggleSearch) {
      toggleSearch();
    }
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  const handleRecentMiniSearch = (id: number) => {
    if (toggleSearch) {
      toggleSearch();
    }
    if (toggleSidebar) {
      toggleSidebar();
    }
    router.push(`/home/flix/${id}`);
  }

  const handleRecentUserSearch = (userId: number) => {
    if (toggleSearch) {
      toggleSearch();
    }
    if (toggleSidebar) {
      toggleSidebar();
    }
    redirectUser(userId, `/home/users/${userId}`)
  }

  const handleRecentSnipSearch = async (postId: number) => {
    const response: PostlistResponse = await getPostDetails(postId.toString());
    if (response.isSuccess && response.data && response.data.length > 0) {

      setInAppSnipsData(response.data);

    }

    if (toggleSearch) {
      toggleSearch();
    }
    if (toggleSidebar) {
      toggleSidebar();
    }


    router.push('/home/snips');
  }

  const handleSearch = useCallback(
    async (query: string, tab: "users" | "videos" | "snips", pageNumber?: number) => {
      const currentPage = pageNumber || 1;

      setSearchTerm(query);
      setActiveTab(tab);

      // Reset results when starting a new search
      if (pageNumber === 1) {
        setSearchResults([]);
        setSearchResultsSnips([]);
      }

      if (!query?.trim()) {
        setSearchResults([]);
        setSearchResultsSnips([]);
        setIsSearching(false);
        setSearchPageAndRef(1);
        return;
      }

      setIsSearching(true);
      try {
        let response;
        let responseSnips;

        const limit = RESULTS_PER_PAGE;
        const offset = (currentPage - 1) * limit;

        if (tab === "users" || tab === "videos") {
          // Call flixSearch for "users" and "videos"
          response = await flixSearch({
            query: query.trim(),
            page: currentPage,
            limit,
            searchUsers: tab === "users",
          });

        } else if (tab === "snips") {
          // Call snipSearch for "snips"
          responseSnips = await snipSearch({
            query: query.trim(),
            offset,
          });

          if (responseSnips?.isSuccess && responseSnips.data) {
            // Transform responseSnips.data (if needed) to match PostlistItem[]
            const transformedSnips: PostlistItem[] = responseSnips.data.map((snip) => ({
              ...snip,
              postTagUser: snip.postTagUser || [], // Default to an empty array if postTagUser is missing
            }));

            setSearchResultsSnips((prev) =>
              currentPage === 1 ? transformedSnips : [...prev, ...transformedSnips]
            );

            if (responseSnips.data.length > 0) {
              setSearchPageAndRef(currentPage + 1);
            }
          }
        }
        if (response?.isSuccess && response.data) {
          setSearchResults((prev) =>
            currentPage === 1 ? response!.data : [...prev, ...response!.data]
          );

          if (response.data.length > 0) {
            setSearchPageAndRef(currentPage + 1);
          }
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const loadMoreResults = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleSearch(searchTerm, activeTab, searchPageRef.current);
  };

  const loadMoreResultsForSnips = async () => {
    // Check if the searchTerm exists
    if (!searchTerm) {
      console.error("Error: searchTerm is empty or undefined", { searchTerm });
      return;
    }

    setIsSearching(true);

    try {
      const limit = 12;
      const offset = (searchPageRef.current - 1) * limit; // Calculate offset based on current page reference

      // Call snipSearch specifically for "snips"
      const responseSnips = await snipSearch({
        query: searchTerm,
        limit: limit,
        offset: offset,
      });
if (responseSnips?.isSuccess && responseSnips.data) {
        if (responseSnips.data.length > 0) {
          // Update results using a callback to ensure the latest state
          setSearchResultsSnips((prevResults) => {
return [...prevResults, ...responseSnips.data];
          });

          // Increment the page counter for the next request
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

  useEffect(() => {
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
  }, [searchTerm, activeTab, handleSearch]);

  return (
    <div className="flex flex-col justify-center">
      {/* Add a backdrop when dropdown is open */}
      {(isSearching || searchResults.length > 0 || searchTerm.trim()) && showDropdown && (
        <div
          className={`fixed inset-0 ${dropdownStyle === "style1" ? "bg-black/10" : ""} z-10`}
          onClick={() => handleSearch("", activeTab)}
        />
      )}

      <div
        className={`flex items-center gap-6 pt-3 px-1 bg-gradient-to-t relative z-40`}
        onClick={(e) => {
          // Close dropdown if clicking outside the search container
          if (!(e.target as HTMLElement).closest(".search-container")) {
            handleSearch("", activeTab); // Clear search
          }
        }}
      >
        <div className="flex-1 max-w-3xl mx-auto relative">
          <SearchBar
            placeholder="Search..."
            className="w-full"
            onSearch={(query) => handleSearch(query, activeTab)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dropdownVisibility={dropdownVisibility}
          />

          {(!isSearching && searchResults.length === 0 && dropdownStyle === "style2" && searchTerm.trim() === "") && (
            <div>
              {/* Clear all button shown only if anything exists */}
              {(recentSearchUsers.length > 0 || recentSearchMinis.length > 0 || recentSearchSnips.length > 0) && (
                <div className="flex justify-end mb-2">
                  <button
                    className="text-sm text-primary hover:underline"
                    onClick={clearHistory}
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Recent Viewed Minis */}
              {recentSearchMinis.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Recent Viewed Minis</h3>
                  <ul className="space-y-2 mb-4">
                    {recentSearchMinis.map((item, index) => (
                      <li
                        key={`mini-${index}`}
                        className="flex items-center justify-between bg-hover-color hover:bg-secondary-bg-color p-2 rounded group"
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleRecentMiniSearch(item.id)}
                        >
                          <Avatar src={item.coverFile} width="w-10" height="h-10" />
                          <div className="text-sm">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted">{item.username}</p>
                          </div>
                        </div>
                        <button
                          className="text-text-color hover:text-red-500 text-sm ml-4"
                          onClick={() => removeSearch(index)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Recent Viewed Users */}
              {recentSearchUsers.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Recent Viewed Users</h3>
                  <ul className="space-y-2 mb-4">
                    {recentSearchUsers.map((item, index) => (
                      <li
                        key={`user-${index}`}
                        className="flex items-center justify-between bg-hover-color hover:bg-secondary-bg-color p-2 rounded group"
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleRecentUserSearch(item.userId)}
                        >
                          <Avatar src={item.userProfileImage} width="w-10" height="h-10" />
                          <span className="text-sm">{item.username}</span>
                        </div>
                        <button
                          className="text-text-color hover:text-red-500 text-sm ml-4"
                          onClick={() => removeSearch(index)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Recent Viewed Snips */}
              {recentSearchSnips.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Recent Viewed Snips</h3>
                  <ul className="space-y-2">
                    {recentSearchSnips.map((item, index) => (
                      <li
                        key={`snip-${index}`}
                        className="flex items-center justify-between bg-hover-color hover:bg-secondary-bg-color p-2 rounded group"
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleRecentSnipSearch(item.postId)}
                        >
                          <Avatar src={item.coverFile} width="w-10" height="h-10" />
                          <div className="text-sm">
                            <p className="font-medium text-white">{item.postTitle}</p>
                            <p className="text-xs text-muted text-white">{item.username}</p>
                          </div>
                        </div>
                        <button
                          className="text-text-color hover:text-red-500 text-sm ml-4"
                          onClick={() => removeSearch(index)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Fallback UI */}
              {recentSearchUsers.length === 0 &&
                recentSearchMinis.length === 0 &&
                recentSearchSnips.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-text-color">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 mb-3 text-text-color"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-base font-medium">No recent activity</p>
                    <p className="text-sm text-text-color">Your viewing history will appear here</p>
                  </div>
                )}
            </div>
          )}


          {/* Search Results Dropdown */}
          {(isSearching || searchResults.length > 0 || searchTerm.trim()) && showDropdown && (
            <div className={`absolute top-full left-0 ${dropdownStyle === "style1" ? "right-0 border border-border-color rounded-lg shadow-lg overflow-hidden" : "right-0"
              } bg-bg-color text-text-color mt-2 search-container`}>
              {/* Tabs */}
              <div className="flex">
                <button
                  onClick={() => handleSearch(searchTerm, "videos")}
                  className={`flex-1 text-center py-2 ${activeTab === "videos"
                    ? "border-b-2 border-primary linearText"
                    : "text-text-color"
                    }`}
                >
                  Mini
                </button>
                <button
                  onClick={() => handleSearch(searchTerm, "users")}
                  className={`flex-1 text-center py-2 ${activeTab === "users"
                    ? "border-b-2 border-primary linearText"
                    : "text-text-color"
                    }`}
                >
                  Users
                </button>
                <button
                  onClick={() => handleSearch(searchTerm, "snips")}
                  className={`flex-1 text-center py-2 ${activeTab === "snips"
                    ? "border-b-2 border-primary linearText"
                    : "text-text-color"
                    }`}
                >
                  Snips
                </button>
              </div>

              {/* Render Results Based on Active Tab */}
              <div className={`${dropdownStyle === "style1" ? "max-h-[400px]" : "max-h-[80vh]"
                } overflow-y-auto custom-scrollbar`}>
                {activeTab === "videos" && (
                  <SearchMinis
                    searchResults={searchResults}
                    isSearching={isSearching}
                    loadMoreResults={loadMoreResults}
                    searchTerm={searchTerm}
                    handleResultClick={handleResultClick}
                  />
                )}
                {activeTab === "users" && (
                  <SearchUsers
                    searchResults={searchResults}
                    isSearching={isSearching}
                    loadMoreResults={loadMoreResults}
                    searchTerm={searchTerm}
                    handleResultClick={handleResultClick}
                  />
                )}
                {activeTab === "snips" && (
                  <SearchSnips
                    searchResultsSnips={searchResultsSnips}
                    isSearching={isSearching}
                    loadMoreResultsForSnips={loadMoreResultsForSnips}
                    selectedSnip={selectedSnip}
                    setSelectedSnip={() => { }}
                    isSnipsModalOpen={isSnipsModalOpen}
                    setIsSnipsModalOpen={() => { }}
                    searchTerm={searchTerm}
                    handleSnipResultClick={handleSnipResultClick}
                    searchPage={searchPageRef.current}
                    onClose={closeSnipsModal}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;