'use client';
import { SearchSnipsSkeleton } from '@/components/Skeletons/Skeletons';
import SnipsModal from "@/components/modal/SnipsModal";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import { PostlistItem } from "@/models/postlistResponse";
import { useRouter } from "next/navigation";
import React from "react";
import SafeImage from '../shared/SafeImage';

interface SearchSnipsProps {
  searchResultsSnips: PostlistItem[];
  isSearching: boolean;
  loadMoreResultsForSnips: () => void;
  selectedSnip?: PostlistItem | null;
  setSelectedSnip: React.Dispatch<React.SetStateAction<PostlistItem | null>>;
  isSnipsModalOpen: boolean;
  setIsSnipsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  handleSnipResultClick: (result: PostlistItem) => void;
  searchPage?: number;
  onClose: () => void;
}

const SearchSnips: React.FC<SearchSnipsProps> = ({
  searchResultsSnips,
  isSearching,
  loadMoreResultsForSnips,
  selectedSnip,
  setSelectedSnip,
  isSnipsModalOpen,
  setIsSnipsModalOpen,
  searchTerm,
  handleSnipResultClick,
  searchPage,
  onClose,
}) => {
  const {
    setInAppSnipsData,
    setSnipIndex,
  } = useInAppRedirection();
  const router = useRouter();
  const handleSnipClick = (snip: PostlistItem) => {
    handleSnipResultClick(snip);
    setInAppSnipsData(searchResultsSnips);
    const snipIndex = searchResultsSnips.findIndex(snips => snips.postId === snip?.postId);
    setSnipIndex(snipIndex);
    router.push('/home/snips');
  }
  return (
    <div>
      {isSearching ? (
        <SearchSnipsSkeleton />
      ) : searchResultsSnips.length > 0 ? (
        <div className="grid grid-cols-3 max-h-[400px] overflow-y-auto custom-scrollbar divide-y divide-border-color mt-1">
          {searchResultsSnips.map((result) => (
            <div
              key={result.postId}
              className="border border-border-color hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleSnipClick(result)}
            >
              <div className="relative w-full h-60 bg-secondary-bg-color rounded overflow-hidden">
                {result.coverFile ? (
                  <SafeImage
                    src={result.coverFile}
                    alt={result.postTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-text-light">No Image</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 text-primary-text-color p-2">
                  <h3 className="text-sm font-medium line-clamp-1 text-white">
                    {result.postTitle}
                  </h3>
                  <p className="text-xs text-white">{result.userName}</p>
                </div>
              </div>

            </div>
          ))}
          <div className="col-span-3 flex justify-center items-center mt-1">
            {searchResultsSnips.length >= 12 && (
              <button
                onClick={
                  loadMoreResultsForSnips
                }
                className="px-4 py-2 text-sm font-medium text-text-color bg-secondary-bg-color/50 hover:bg-secondary-bg-color rounded-md transition-colors duration-200 search-container"
              >
                Show More
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 px-6">
          <p className="text-primary-text-color">
            No results found for &quot;{searchTerm}&quot;
          </p>
        </div>
      )}
      {isSnipsModalOpen && selectedSnip && (
        <SnipsModal
          snips={searchResultsSnips}
          selectedSnip={selectedSnip}
          onClose={onClose}
          searchterm={searchTerm}
          searchPage={searchPage}
        />
      )}
    </div>
  );
};

export default SearchSnips;