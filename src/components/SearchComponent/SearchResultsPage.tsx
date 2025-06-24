"use client";
import { useEffect, useState, useCallback } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { flixSearch, SearchResultItem as FlixSearchResultItem } from "@/services/flixsearch";
import { snipSearch } from "@/services/snipsearch";
import SafeImage from "../shared/SafeImage";
import Avatar from "../Avatar/Avatar";
import { PostlistItem } from "@/models/postlistResponse";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";

type TabType = "videos" | "users" | "snips";
const TABS: TabType[] = ["videos", "users", "snips"];

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const tab = (searchParams?.get("tab") as TabType) || "videos";
  const {setInAppSnipsData,setSnipIndex} = useInAppRedirection();

  const [minisResults, setMinisResults] = useState<FlixSearchResultItem[]>([]);
  const [usersResults, setUsersResults] = useState<FlixSearchResultItem[]>([]);
  const [snipsResults, setSnipsResults] = useState<PostlistItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchResults = useCallback(async () => {
    setIsSearching(true);
    try {
      if (tab === "videos") {
        const res = await flixSearch({ query, page: 1, limit: 24, searchUsers: false });
        setMinisResults(res?.data ?? []);
      } else if (tab === "users") {
        const res = await flixSearch({ query, page: 1, limit: 24, searchUsers: true });
        setUsersResults(res?.data ?? []);
      } else if (tab === "snips") {
        const res = await snipSearch({ query, offset: 0 });
        setSnipsResults(res?.data ?? []);
      }
    } catch {
      if (tab === "videos") setMinisResults([]);
      if (tab === "users") setUsersResults([]);
      if (tab === "snips") setSnipsResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, tab]);

  useEffect(() => {
    if (query) fetchResults();
  }, [query, tab, fetchResults]);

  const handleTabClick = (newTab: TabType) => {
    router.push(`/home/search?q=${encodeURIComponent(query)}&tab=${newTab}`);
  };

  const redirectSnip = (snip: PostlistItem)=>{
    setInAppSnipsData(snipsResults);
    const snipIndex = snipsResults.findIndex(snips => snips.postId === snip?.postId);
    setSnipIndex(snipIndex);
    router.push('/home/snips');
  }

  function renderMini(item: FlixSearchResultItem) {
    return (
      <div
        key={item.id}
        className="flex flex-col sm:flex-row w-full gap-4 p-2 rounded-lg cursor-pointer hover:bg-primary-bg-color transition"
        onClick={() => router.push(`/home/flix/${item.id}`)}
      >
        {/* 16:9 Thumbnail */}
        <div className="flex-shrink-0 w-full sm:w-80 md:w-96 aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <SafeImage
            src={item.coverFile}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{ aspectRatio: "16/9" }}
          />
        </div>
        {/* Details */}
        <div className="flex flex-col justify-between flex-1 mt-2 sm:mt-0">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{item.title}</h2>
            <div className="flex items-center gap-2 mb-2">
              <Avatar src={item.userProfileImage} name={item.username}/>
              <span className="font-medium">{item.username}</span>
              {item.userFullName && (
                <span className="text-gray-500 text-sm">({item.userFullName})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderUser(item: FlixSearchResultItem) {
    return (
      <div
        key={item.userid}
        className="flex items-center gap-4 py-4 border-b cursor-pointer hover:bg-gray-50 transition"
        onClick={() => router.push(`/home/users/${item.userid}`)}
      >
        <Avatar src={item.userProfileImage} name={item.username} width="w-16" height="h-16"/>
        <div>
          <div className="text-lg font-semibold">@{item.username}</div>
          {item.userFullName && (
            <div className="text-gray-500">{item.userFullName}</div>
          )}
        </div>
      </div>
    );
  }

  // Grid of 9:16 thumbnails, like Instagram Reels
  function renderSnipsGrid() {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
        {snipsResults.map((item) => (
          <div
            key={item.postId}
            className="w-full aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition"
            onClick={()=>redirectSnip(item)}
          >
            <SafeImage
              src={item.coverFile}
              alt={item.postTitle}
              className="w-full h-full object-cover"
              style={{ aspectRatio: "9/16" }}
            />
          </div>
        ))}
      </div>
    );
  }

  // --- Main render ---
  return (
    <div className="max-w-3xl mx-auto px-1 py-8 max-md:pb-20 ">
      {/* Tabs */}
      <div className="flex items-center mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            className={`relative px-2 pb-3 text-lg font-medium transition-colors duration-200 w-full
              ${tab === t ? "linearText" : "text-text-color"}
              bg-transparent border-none outline-none`}
            onClick={() => handleTabClick(t)}
          >
            <span>{t==="videos" ? "Minis" : t.charAt(0).toUpperCase() + t.slice(1)}</span>
            <span
              className={`absolute left-0 right-0 bottom-0 h-[3px] ${tab===t ? "linearBackground" : "bg-primary-bg-color"}`}
            />
          </button>
        ))}
      </div>
      {/* Results */}
      <div>
        {isSearching && <div className="text-center py-10">Loading...</div>}
        {!isSearching && tab === "videos" && minisResults.length === 0 && (
          <div className="text-center py-10 text-gray-400">No minis found.</div>
        )}
        {!isSearching && tab === "users" && usersResults.length === 0 && (
          <div className="text-center py-10 text-gray-400">No users found.</div>
        )}
        {!isSearching && tab === "snips" && snipsResults.length === 0 && (
          <div className="text-center py-10 text-gray-400">No snips found.</div>
        )}

        {tab === "videos" &&
          minisResults.map(renderMini)}
        {tab === "users" &&
          usersResults.map(renderUser)}
        {tab === "snips" &&
          renderSnipsGrid()}
      </div>
    </div>
  );
}