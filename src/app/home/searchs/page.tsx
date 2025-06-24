"use client"

import { ModerSpinner } from '@/components/LoadingSpinner'
import SearchPost from '@/components/searchPosts/SearchPost'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import Suggestion from '@/components/suggestions/Suggestion'
import { SearchData } from '@/models/searchResponse'
import { getSearched } from '@/services/discoverSearch'
import React, { useEffect, useRef, useState } from 'react'

export default function Page() {
    // State initialization
    const [searchData, setSearchData] = useState<SearchData>({ data: [] });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchInput, setSearchInput] = useState<string>("");
    const [activeCategory, setActiveCategory] = useState<string>("User");
    const [pageNo, setPageNo] = useState<number>(1);
    const [isNewSearch, setIsNewSearch] = useState<boolean>(true);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    // Mark component as mounted on client side
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const searchFn = async (category: string, page: number) => {
        try {
            setIsLoading(true);
            let params;
            switch (category) {
                case "User":
                    params = { isAll: 0, isAudio: 0, isHashTag: 0, isUser: 1, pageNo: page, searchValue: searchInput };
                    break;
                case "HashTag":
                    params = { isAll: 0, isAudio: 0, isHashTag: 1, isUser: 0, pageNo: page, searchValue: searchInput };
                    break;
                case "Audio":
                    params = { isAll: 0, isAudio: 1, isHashTag: 0, isUser: 0, pageNo: page, searchValue: searchInput };
                    break;
                default:
                    params = { isAll: 1, isAudio: 0, isHashTag: 0, isUser: 0, pageNo: page, searchValue: searchInput };
            }

            const response = await getSearched(params);
            const newSearch: SearchData = {
                data: Array.isArray(response.data) ? response.data : []
            };

            //append only on scroll and not on new search
            setSearchData((prev) => {
                return (
                    isNewSearch ? newSearch : { data: [...prev.data, ...newSearch.data] }
                );
            });
            setHasMore(newSearch.data.length > 0);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching search data:", error);
        }
    };

    const loadMore = () => {
        setIsNewSearch(false);
        setPageNo(pageNo + 1);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsNewSearch(true);
        setHasMore(true);
        setSearchInput(e.target.value);
        setPageNo(1);
    };

    const handleCategoryClick = (category: string) => {
        setIsNewSearch(true);
        setHasMore(true);
        setActiveCategory(category);
        setPageNo(1);
        searchFn(category, 1);
    };

    // Initialize IntersectionObserver only on client side
    useEffect(() => {
        // Only run this effect on the client side
        if (!isMounted) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading && hasMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [isLoading, hasMore, isMounted]);

    // Search effect
    useEffect(() => {
        // Only run search on client side
        if (isMounted) {
            searchFn(activeCategory, pageNo);
        }
    }, [activeCategory, searchInput, pageNo, isMounted]);

    // Loading skeleton for SSR
    if (!isMounted) {
        return (
            <div className='flex p-3 justify-around h-screen'>
                <div className='flex flex-col items-start space-y-3 w-[60%] max-md:w-full'>
                    {/* Search input skeleton */}
                    <div className='md:px-4 w-full'>
                        <div className='w-full h-10 bg-secondary-bg-color rounded-lg animate-pulse'></div>
                    </div>

                    {/* Category buttons skeleton */}
                    <div className="md:px-4 w-full">
                        <div className="grid grid-cols-4 space-x-2">
                            {[1, 2, 3, 4].map((_, index) => (
                                <div key={index} className="h-8 bg-secondary-bg-color rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Content skeleton */}
                    <div className='w-full h-full'>
                        {[1, 2, 3, 4, 5].map((_, index) => (
                            <div key={index} className="mb-4 p-3 rounded-lg bg-secondary-bg-color h-24 animate-pulse"></div>
                        ))}
                    </div>
                </div>

                <div className='max-md:hidden w-[40%] flex justify-center items-center'>
                    <div className='w-full h-96 bg-secondary-bg-color rounded-lg animate-pulse'></div>
                </div>
            </div>
        );
    }

    // Client-side rendered content
    return (
        <div className='flex p-3 justify-around h-screen'>
            <div className='flex flex-col items-start space-y-3 w-[60%] max-md:w-full'>
                <div className='md:px-4 w-full'>
                    <Input
                        type="text"
                        placeholder='Search Here....'
                        value={searchInput}
                        onChange={handleSearch}
                        className='w-full p-2 bg-primary-bg-color rounded-lg focus:outline-none'
                    />
                </div>
                <div className="md:px-4">
                    <div className="grid grid-cols-4 space-x-2">
                        {["All", "User", "HashTag", "Audio"].map((category, index) => (
                            <Button
                                isLinearBtn={activeCategory === category}
                                isLinearBorder={activeCategory !== category}
                                key={index}
                                onCLick={() => handleCategoryClick(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className='w-full overflow-y-scroll h-full max-md:pb-14'>
                    {searchData.data && <SearchPost data={searchData.data} searchInput={searchInput} />}
                    <div ref={loaderRef} />
                    {hasMore ? (
                        isLoading &&
                        <div className='flex justify-center items-center w-full h-12'>
                            <ModerSpinner />
                        </div>
                    ) : (
                        <div className='flex justify-center items-center w-full h-12'>
                            <p className='text-lg'>You&apos;ve Reached The End</p>
                        </div>
                    )}
                </div>
            </div>
            <div className='max-md:hidden w-[40%] flex justify-center items-center'>
                <Suggestion isfull={true} />
            </div>
        </div>
    );
}